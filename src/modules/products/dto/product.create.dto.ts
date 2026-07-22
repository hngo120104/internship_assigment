import { IsBoolean, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ProductCreateRequestDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() type!: string;
  @IsString() description?: string;
  @IsNotEmpty() @IsNumber() @Min(0) price!: number;
  @IsNotEmpty() @IsNumber() @Min(0) stock!: number;
  @IsNotEmpty() @IsBoolean() isActive!: boolean;
}
