import { Exclude, Expose } from 'class-transformer';
import { ShopStatus } from '../../entities/shop.entity';

@Exclude()
export class UserShopResponseDto {
  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose()
  id!: string;

  @Expose({ name: 'shopName' })
  shop_name!: string;

  @Expose()
  description?: string;

  @Expose()
  address?: string;

  @Expose({ name: 'shopStatus' })
  shop_status!: ShopStatus;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;
}
