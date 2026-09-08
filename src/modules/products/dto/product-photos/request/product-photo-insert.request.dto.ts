import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProductPhotoInsertRequestDto {
  @IsNotEmpty()
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'is_primary' })
  isPrimary?: boolean;
}
