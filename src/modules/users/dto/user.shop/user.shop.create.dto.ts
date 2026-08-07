import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserShopCreateDto {
  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'shop_name' })
  shopName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}
