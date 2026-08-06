import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ProductCreateRequestDto } from './product.create.dto';

export class ProductUpdateDto extends PartialType(
  OmitType(ProductCreateRequestDto, ['categoryIds', 'photos'] as const),
) {}
