import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ProductVariantCreateRequestDto } from './product.variant.create.request.dto';

export class ProductVariantsCreateRequestDto {
  @Expose()
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
}
