import { Expose, Transform } from 'class-transformer';

export class ProductPhotoResponseDto {
  @Expose()
  url!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'is_primary' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  isPrimary!: boolean;
}
