import { Expose, Transform, Type } from 'class-transformer';
import { ProductPhotoResponseDto } from './product.photos.insert.response.dto';

export class ProductPhotosResponseDto {
  @Expose({ name: 'product_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  productId!: string;

  @Expose()
  @Type(() => ProductPhotoResponseDto)
  photos!: ProductPhotoResponseDto[];
}
