import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductPhotoResponseDto {
  @Expose()
  url!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'is_primary' })
  isPrimary!: boolean;
}
