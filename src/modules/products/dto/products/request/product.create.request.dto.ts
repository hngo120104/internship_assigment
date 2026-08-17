import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
  Length,
  ArrayUnique,
  ArrayMinSize,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ProductPhotoInsertRequestDto } from '../../product.photos/request/product.photos.insert.request.dto';
import { ProductVariantCreateRequestDto } from '../../product.variants/request/product.variant.create.request.dto';

export class ProductCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 255, { message: 'Name must be between 10 and 255 characters.' })
  name!: string;

  @IsNotEmpty()
  @IsUUID('all', { each: true })
  @IsArray()
  @ArrayUnique({ message: 'Categories cannot be duplicated.' })
  @Expose({ name: 'category_ids' })
  categoryIds!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPhotoInsertRequestDto)
  @IsNotEmpty()
  photos!: ProductPhotoInsertRequestDto[];

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Description must not exceed 5000 characters.' })
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(
    (variant: ProductVariantCreateRequestDto) =>
      `${variant.size ?? ''}:${variant.color?.trim().toLowerCase() ?? ''}`,
    { message: 'Product variants cannot be duplicated.' },
  )
  @ValidateNested({ each: true })
  @Type(() => ProductVariantCreateRequestDto)
  variants!: ProductVariantCreateRequestDto[];

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: 'is_active' })
  isActive!: boolean;
}
