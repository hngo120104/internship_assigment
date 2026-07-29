import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProductPhotosInsertRequestDto {
  @IsNotEmpty()
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
