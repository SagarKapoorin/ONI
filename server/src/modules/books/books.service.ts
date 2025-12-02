import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { BooksRepository } from "./books.repository";
import { RedisService } from "../../core/redis/redis.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { QueryBooksDto } from "./dto/query-books.dto";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly redisService: RedisService,
    private readonly logger: PinoLogger
  ) {}

  async create(dto: CreateBookDto) {
    const book = await this.booksRepository.create(dto);
    await this.redisService.resetPrefix("books:list");
    return book;
  }

  async findAll(query: QueryBooksDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const cacheKey = `books:list:${page}:${limit}:${query.authorId || ""}:${query.isBorrowed || ""}:${
      query.search || ""
    }`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      return cached;
      // this.logger.info(`Cache hit for key: ${cacheKey}`);
    }
    const skip = (page - 1) * limit;
    const result = await this.booksRepository.list({
      skip,
      take: limit,
      authorId: query.authorId,
      isBorrowed:
        typeof query.isBorrowed === "string"
          ? query.isBorrowed === "true"
          : undefined,
      search: query.search,
    });
    const response = {
      items: result.items,
      total: result.total,
      page,
      limit,
    };
    await this.redisService.set(cacheKey, response);
    return response;
  }

  async findOne(id: number) {
    const cacheKey = `books:detail:${id}`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException("Book not found");
    }
    await this.redisService.set(cacheKey, book);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException("Book not found");
    }
    const updated = await this.booksRepository.update(id, dto);
    this.logger.info(`Book with ID: ${id} updated`);
    await this.redisService.del(`books:detail:${id}`);
    await this.redisService.resetPrefix("books:list");
    return updated;
  }

  async delete(id: number) {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException("Book not found");
    }
    await this.booksRepository.delete(id);
    await this.redisService.del(`books:detail:${id}`);
    await this.redisService.resetPrefix("books:list");
    return { success: true };
  }

  async borrowBook(userId: number, bookId: number) {
    const lockKey = `lock:book:${bookId}:borrow`;
    const acquired = await this.redisService.acquireLock(lockKey, 5);
    if (!acquired) {
      throw new ConflictException("Book is being processed");
    }
    try {
      const result = await this.booksRepository.borrowBook(userId, bookId);
      if (result === null) {
        throw new NotFoundException("Book not found");
      }
      if (result === "alreadyBorrowed") {
        throw new ConflictException("Book already borrowed");
      }
      await this.redisService.del(`books:detail:${bookId}`);
      await this.redisService.resetPrefix("books:list");
      return result;
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }

  async returnBook(userId: number, bookId: number) {
    const lockKey = `lock:book:${bookId}:borrow`;
    const acquired = await this.redisService.acquireLock(lockKey, 5);
    if (!acquired) {
      throw new ConflictException("Book is being processed");
    }
    try {
      const result = await this.booksRepository.returnBook(userId, bookId);
      if (result === "notBorrowed") {
        throw new ConflictException("Book is not borrowed");
      }
      if (result === "notOwner") {
        throw new ForbiddenException("You did not borrow this book");
      }
      // this.logger.info(`Book with ID: ${bookId} returned by user ID: ${userId}`);
      await this.redisService.del(`books:detail:${bookId}`);
      await this.redisService.resetPrefix("books:list");
      return result;
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }
}
