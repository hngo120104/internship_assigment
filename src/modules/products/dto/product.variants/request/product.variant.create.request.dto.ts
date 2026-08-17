import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ProductSize } from '../../../enum/product.size.enum';

export class ProductVariantCreateRequestDto {
  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  color?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(1000000, { message: 'Stock max is 1000000' })
  amount!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  price!: number;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: 'is_active' })
  isActive!: boolean;
}
