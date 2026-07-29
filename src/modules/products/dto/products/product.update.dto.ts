import { PartialType } from '@nestjs/mapped-types';
import { ProductCreateRequestDto } from './product.create.dto';

export class ProductUpdateDto extends PartialType(ProductCreateRequestDto) {}
