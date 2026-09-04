import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(9999)
  page!: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(10)
  @Max(100)
  size!: number;
}
