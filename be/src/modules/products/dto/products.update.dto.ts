import { PartialType } from '@nestjs/mapped-types';
import {  ProductCreaterequestDto } from './products.create.dto';

export class UpdateProductDto extends PartialType(ProductCreaterequestDto) {}
