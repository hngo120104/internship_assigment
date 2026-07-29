import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '../../entities/role.entity';
import { UserResponseDto } from '../users/user.response.dto';

@Exclude()
export class UserShopCreateResponseDto {
  @Type(() => UserResponseDto)
  @Expose()
  user!: UserResponseDto;

  @Expose({ name: 'shopName' })
  shop_name!: string;

  @Expose()
  description?: string;

  @Expose()
  address?: string;

  @Expose()
  access_token!: string;
}
