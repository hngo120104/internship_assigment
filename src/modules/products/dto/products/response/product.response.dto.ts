import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { CategoryResponseDto } from '../../../../category/dto/response/category.response.dto';
import { ProductPhotoResponseDto } from '../../product.photos/response/product.photos.insert.response.dto';
import { Product } from '../../../entities/product.entity';
import { ProductVariantResponseDto } from '../../product.variants/response/product.variant.response.dto';

export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'shop_id' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  shopId!: string;

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
  @Type(() => ProductVariantResponseDto)
  variants!: ProductVariantResponseDto[];

  @Expose({ name: 'is_active' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  isActive!: boolean;
}
