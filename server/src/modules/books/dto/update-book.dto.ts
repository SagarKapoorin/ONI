import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  authorId?: number;

  @IsBoolean()
  @IsOptional()
  isBorrowed?: boolean;
}
