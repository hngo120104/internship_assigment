import { Expose, Transform } from 'class-transformer';
import { ShopStatus } from '../../../entities/shop.entity';

export class UserShopResponseDto {
  @Expose({ name: 'user_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  userId!: string;

  @Expose()
  id!: string;

  @Expose({ name: 'shop_name' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  shopName!: string;

  @Expose()
  description?: string;

  @Expose()
  address?: string;

  @Expose({ name: 'shop_status' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  shopStatus!: ShopStatus;

  @Expose({ name: 'created_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  updatedAt!: Date;
}
