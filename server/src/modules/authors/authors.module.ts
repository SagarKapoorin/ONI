import { Module } from "@nestjs/common";
import { AuthorsService } from "./authors.service";
import { AuthorsRepository } from "./authors.repository";
import { AuthorsController } from "./authors.controller";

@Module({
  providers: [AuthorsService, AuthorsRepository],
  controllers: [AuthorsController],
})
export class AuthorsModule {}
