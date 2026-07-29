import { Exclude, Expose, Type } from 'class-transformer';
import { ProductPhotoResponseDto } from './product.photos.insert.response.dto';

@Exclude()
export class ProductPhotosResponseDto {
  @Expose({ name: 'productId' })
  product_id!: string;

  @Expose()
  @Type(() => ProductPhotoResponseDto)
  photos!: ProductPhotoResponseDto[];
}
