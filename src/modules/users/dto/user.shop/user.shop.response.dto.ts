import { Exclude, Expose } from 'class-transformer';

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
}
