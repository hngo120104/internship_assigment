import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  Length,
  Max,
  ArrayUnique,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ProductPhotosInsertDto } from '../product.photos/product.photos.insert.dto';

export class ProductCreateDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 500, { message: 'Name must be between 10 and 500 characters.' })
  name!: string;

  @IsNotEmpty()
  @IsUUID('all', { each: true })
  @IsArray()
  @ArrayUnique({ message: 'Categories cannot be duplicated.' })
  @Expose({ name: 'category_ids' })
  categoryIds!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPhotosInsertDto)
  @IsNotEmpty()
  photos!: ProductPhotosInsertDto[];

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Description must not exceed 5000 characters.' })
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(999999999)
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000000, { message: 'Stock max is 1000000' })
  amount!: number;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: 'is_active' })
  isActive!: boolean;
}
