import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ProductCreateDto } from './product.create.dto';

export class ProductUpdateDto extends PartialType(
  OmitType(ProductCreateDto, ['categoryIds', 'photos'] as const),
) {}
