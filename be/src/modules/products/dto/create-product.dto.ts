import { IsNotEmpty, IsNumber, IsString, Min, min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() description?: string;
  @IsNotEmpty() @IsNumber() @Min(0) price!: number;
  @IsNotEmpty() @IsNumber() @Min(0) stock!: number;
  @IsNotEmpty() @IsString() status!: string;
}
