import { PartialType } from '@nestjs/mapped-types';
import {  ProductCreateRequestDto } from './products.create.dto';

export class ProductUpdateDto extends PartialType(ProductCreateRequestDto) {}
