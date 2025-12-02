import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class AuthorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string }) {
    return this.prisma.author.create({
      data,
    });
  }

  findAll() {
    return this.prisma.author.findMany({
      orderBy: { id: "asc" },
      include: { books: true },
    });
  }

  findById(id: number) {
    return this.prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });
  }

  update(id: number, data: Partial<{ name: string }>) {
    return this.prisma.author.update({
      where: { id },
      data,
      include: { books: true },
    });
  }

  delete(id: number) {
    return this.prisma.author.delete({
      where: { id },
    });
  }
}
