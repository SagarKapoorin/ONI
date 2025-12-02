import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { title: string; authorId: number }) {
    return this.prisma.book.create({
      data,
      include: { author: true },
    });
  }

  findById(id: number) {
    return this.prisma.book.findUnique({
      where: { id },
      include: { author: true, borrowedInfo: true },
    });
  }

  update(
    id: number,
    data: Partial<{ title: string; authorId: number; isBorrowed: boolean }>,
  ) {
    return this.prisma.book.update({
      where: { id },
      data,
      include: { author: true, borrowedInfo: true },
    });
  }

  delete(id: number) {
    return this.prisma.book.delete({
      where: { id },
    });
  }

  async list(params: {
    skip: number;
    take: number;
    authorId?: number;
    isBorrowed?: boolean;
    search?: string;
  }) {
    const where: any = {};
    if (params.authorId) {
      where.authorId = params.authorId;
    }
    if (typeof params.isBorrowed === "boolean") {
      where.isBorrowed = params.isBorrowed;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }
    const [items, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { id: "asc" },
        include: { author: true, borrowedInfo: true },
      }),
      this.prisma.book.count({ where }),
    ]);
    return { items, total };
  }

  async borrowBook(userId: number, bookId: number) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return null;
    }
    if (book.isBorrowed) {
      return "alreadyBorrowed";
    }
    const borrowed = await this.prisma.borrowedBook.create({
      data: {
        userId,
        bookId,
      },
    });
    await this.prisma.book.update({
      where: { id: bookId },
      data: { isBorrowed: true },
    });
    return borrowed;
  }

  async returnBook(userId: number, bookId: number) {
    const borrowed = await this.prisma.borrowedBook.findUnique({
      where: { bookId },
      include: { user: true },
    });
    if (!borrowed) {
      return "notBorrowed";
    }
    if (borrowed.userId !== userId) {
      return "notOwner";
    }
    await this.prisma.borrowedBook.update({
      where: { id: borrowed.id },
      data: { returnedAt: new Date() },
    });
    await this.prisma.book.update({
      where: { id: bookId },
      data: { isBorrowed: false },
    });
    return borrowed;
  }
}
