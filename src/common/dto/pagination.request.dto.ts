import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  page!: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(30)
  size!: number;
}
