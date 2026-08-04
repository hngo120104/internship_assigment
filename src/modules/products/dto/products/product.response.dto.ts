import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from '../../../category/dto/category.response.dto';
import { ProductPhotoResponseDto } from '../product.photos/product.photos.insert.response.dto';

@Exclude()
export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'shop_id' })
  shopId!: string;

  @Expose()
  name!: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  categories!: CategoryResponseDto[];

  @Expose()
  @Type(() => ProductPhotoResponseDto)
  photos!: ProductPhotoResponseDto[];

  @Expose()
  description?: string;

  @Expose()
  price!: number;

  @Expose()
  amount!: number;

  @Expose({ name: 'is_active' })
  isActive!: boolean;
}
