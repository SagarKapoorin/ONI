import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role ?? Role.USER,
      },
    });
  }

  findAll(pagination: { skip: number; take: number }) {
    return this.prisma.user.findMany({
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { id: "asc" },
    });
  }

  countAll() {
    return this.prisma.user.count();
  }

  findBorrowedBooksByUser(userId: number) {
    return this.prisma.borrowedBook.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            author: true,
          },
        },
      },
    });
  }
}
