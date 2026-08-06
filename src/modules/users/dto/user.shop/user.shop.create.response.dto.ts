import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../users/user.response.dto';
import { ShopStatus } from '../../entities/shop.entity';

@Exclude()
export class UserShopCreateResponseDto {
  @Type(() => UserResponseDto)
  // @Expose()
  user!: UserResponseDto;

  @Expose()
  id!: string;

  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose({ name: 'shopName' })
  shop_name!: string;

  @Expose()
  description?: string;

  @Expose()
  address?: string;

  @Expose({ name: 'userStatus' })
  shop_status!: ShopStatus;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;

  @Expose()
  access_token!: string;
}
