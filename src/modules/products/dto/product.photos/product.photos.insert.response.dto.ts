import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductPhotoResponseDto {
  @Expose()
  url!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'isPrimary' })
  is_primary!: boolean;
}
