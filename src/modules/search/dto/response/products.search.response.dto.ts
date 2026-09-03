import { Expose, Transform, TransformFnParams } from 'class-transformer';
export class ProductsSearchResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'product_name' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  productName!: string;

  @Expose()
  thumbnail!: string;

  @Expose({ name: 'min_price' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  minPrice!: number;
}
