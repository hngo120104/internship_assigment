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
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ProductPhotosInsertRequestDto } from '../product.photos/product.photos.insert.request.dto';

export class ProductCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsUUID('all', { each: true })
  @IsArray()
  @Expose({ name: 'category_ids' })
  categoryIds!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPhotosInsertRequestDto)
  @IsNotEmpty()
  photos!: ProductPhotosInsertRequestDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: 'is_active' })
  isActive!: boolean;
}
