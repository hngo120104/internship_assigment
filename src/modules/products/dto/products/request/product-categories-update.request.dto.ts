import { Expose } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ProductCategoriesUpdateRequestDto {
  @Expose({ name: 'category_ids' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique({ message: 'Categories cannot be duplicated.' })
  @IsUUID('all', { each: true })
  categoryIds!: string[];
}
