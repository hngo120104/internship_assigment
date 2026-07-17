import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ProductCreaterequestDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() description?: string;
  @IsNotEmpty() @IsNumber() @Min(0) price!: number;
  @IsNotEmpty() @IsNumber() @Min(0) stock!: number;
  @IsNotEmpty() @IsString() status!: string;
}
