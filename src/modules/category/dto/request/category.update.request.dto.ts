import { PartialType } from '@nestjs/mapped-types';
import { CategoryCreateRequestDto } from './category.create.request.dto';

export class CategoryUpdateRequestDto extends PartialType(
  CategoryCreateRequestDto,
) {}
