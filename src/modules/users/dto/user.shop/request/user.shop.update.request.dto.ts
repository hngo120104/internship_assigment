import { PartialType } from '@nestjs/mapped-types';
import { UserShopCreateRequestDto } from './user.shop.create.request.dto';

export class UserShopUpdateRequestDto extends PartialType(
  UserShopCreateRequestDto,
) {}
