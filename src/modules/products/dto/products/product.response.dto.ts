import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from '../../../category/dto/category.response.dto';

@Exclude()
export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'shopId' })
  shop_id!: string;

  @Expose()
  name!: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  categories!: CategoryResponseDto[];

  @Expose()
  description?: string;

  @Expose()
  price!: number;

  @Expose()
  stock!: number;

  @Expose({ name: 'isActive' })
  is_active!: boolean;
}
