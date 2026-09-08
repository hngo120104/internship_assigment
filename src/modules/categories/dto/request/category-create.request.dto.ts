import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CategoryCreateRequestDto {
  @IsOptional()
  @IsString()
  @Expose({ name: 'icon_url' })
  iconUrl?: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  @Expose({ name: 'parent_id' })
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'is_active' })
  isActive!: boolean;
}
