import { Module } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BooksRepository } from "./books.repository";
import { BooksController } from "./books.controller";

@Module({
  providers: [BooksService, BooksRepository],
  controllers: [BooksController],
})
export class BooksModule {}
