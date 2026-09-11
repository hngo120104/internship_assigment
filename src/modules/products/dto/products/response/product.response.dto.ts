import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { Product } from '../../../entities/product.entity';
import { ProductVariantResponseDto } from '../../product-variants/response/product-variant.response.dto';

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
  @Transform(
    ({ obj }: TransformFnParams) => {
      const product = obj as Product;
      return product.productCategories?.map((productCategory) => {
        const [name, id] = [
          productCategory.category.name,
          productCategory.categoryId,
        ];
        return { name, id };
      });
    },
    { toClassOnly: true },
  )
  categories!: { name: string; id: string }[];

  @Expose()
  @Transform(({ obj }: TransformFnParams) => {
    const product = obj as Product;
    return product.photos?.map((photo) => {
      const [id, url, isPrimary] = [photo.id, photo.url, photo.isPrimary];
      return { id, url, isPrimary };
    });
  })
  photos!: { id: string; url: string; is_primary: boolean };

  @Expose()
  description?: string;

  @Expose()
  @Type(() => ProductVariantResponseDto)
  variants?: ProductVariantResponseDto[];

  @Expose({ name: 'is_active' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  isActive!: boolean;
}
