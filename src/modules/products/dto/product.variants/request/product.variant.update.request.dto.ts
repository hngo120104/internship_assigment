import { PartialType } from '@nestjs/mapped-types';
import { ProductVariantCreateRequestDto } from './product.variant.create.request.dto';

export class ProductVariantUpdateRequestDto extends PartialType(
  ProductVariantCreateRequestDto,
) {}
