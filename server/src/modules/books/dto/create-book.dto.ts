import { IsInt, IsString, Min } from "class-validator";

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1)
  authorId!: number;
}
