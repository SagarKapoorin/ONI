import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PaginationDto } from "./dto/pagination.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";


@ApiTags("users")
@ApiBearerAuth("access-token")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @Roles("USER", "ADMIN")
  getMe(@CurrentUser() user: any) {
    // console.log("Current User:", user);
    return this.usersService.getMe(user.userId);
  }

  @Get()
  @Roles("ADMIN")
  listUsers(@Query() query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    return this.usersService.listUsers(page, limit);
  }

  @Get(":id/borrowed")
  @Roles("ADMIN")
  getBorrowedByUser(@Param("id", ParseIntPipe) id: number) {
 
    return this.usersService.getBorrowedBooksByUser(id);
  }
}
