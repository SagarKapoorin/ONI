import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthorsRepository } from "./authors.repository";
import { RedisService } from "../../core/redis/redis.service";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class AuthorsService {
  constructor(
      private readonly logger :PinoLogger,
    private readonly authorsRepository: AuthorsRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateAuthorDto) {
    const author = await this.authorsRepository.create(dto);
    await this.redisService.resetPrefix("authors:list");
    return author;
  }

  async findAll() {
    const cacheKey = "authors:list";
    const cached = await this.redisService.get<any>(cacheKey);
    this.logger.info(`Cahcehit`);
    if (cached) {
      // this.logger.info(
      //   `Cache hit for ${cacheKey}, count=${Array.isArray(cached) ? cached.length : 'unknown'}`
      // )
      // this.logger.info(`Cached data for ${cacheKey}: ${JSON.stringify(cached)}`)
      return cached;
    }
    // this.logger.info(`Cache miss for ${cacheKey}, loading from DB`)
    const authors = await this.authorsRepository.findAll();
    await this.redisService.set(cacheKey, authors);
    this.logger.info(`Fetched authors from DB, count=${authors.length}`);
    return authors;
  }

  async findOne(id: number) {
    const cacheKey = `authors:detail:${id}`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }
    const author = await this.authorsRepository.findById(id);
    if (!author) {
      throw new NotFoundException("Author not found");
    }
    await this.redisService.set(cacheKey, author);
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto) {
    const author = await this.authorsRepository.findById(id);
    if (!author) {
      throw new NotFoundException("Author not found");
    }
    const updated = await this.authorsRepository.update(id, dto);
    await this.redisService.del(`authors:detail:${id}`);
    await this.redisService.resetPrefix("authors:list");
    return updated;
  }

  async delete(id: number) {
    const author = await this.authorsRepository.findById(id);
    if (!author) {
      throw new NotFoundException("Author not found");
    }
    await this.authorsRepository.delete(id);
    // this.logger.info(`Author with ID: ${id} deleted`);
    await this.redisService.del(`authors:detail:${id}`);
    await this.redisService.resetPrefix("authors:list");
    return { success: true };
  }
}
