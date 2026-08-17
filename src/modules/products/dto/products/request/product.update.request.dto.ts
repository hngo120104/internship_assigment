import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ProductCreateRequestDto } from './product.create.request.dto';

export class ProductUpdateRequestDto extends PartialType(
  OmitType(ProductCreateRequestDto, [
    'categoryIds',
    'photos',
    'variants',
  ] as const),
) {}
