import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";


@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.usersRepository.findAll({ skip, take: limit }),
      this.usersRepository.countAll(),
    ]);
    // this.logger.info(`Listed users - Page: ${page}, Limit: ${limit}, Total: ${total}`);
    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getBorrowedBooksByUser(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.usersRepository.findBorrowedBooksByUser(userId);
  }

  async getAllBorrowedBooks() {
    return this.usersRepository.findAllBorrowedBooks();
  }
}
