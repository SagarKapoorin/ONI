import { Type } from "class-transformer";
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class QueryBooksDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  authorId?: number;

  @IsBooleanString()
  @IsOptional()
  isBorrowed?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
