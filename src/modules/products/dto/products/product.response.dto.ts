import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
  Type,
} from 'class-transformer';
import { CategoryResponseDto } from '../../../category/dto/category.response.dto';
import { ProductPhotoResponseDto } from '../product.photos/product.photos.insert.response.dto';
import { Product } from '../../entities/product.entity';

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
  @Transform(
    ({ obj }: TransformFnParams) => {
      const product = obj as Product;
      return product.productCategories?.map(
        (productCategory) => productCategory.categoryId,
      );
    },
    { toClassOnly: true },
  )
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

  @Expose({ name: 'isActive' })
  is_active!: boolean;
}
