import { PartialType } from '@nestjs/mapped-types';
import { UserShopCreateDto } from './user.shop.create.dto';

export class UserShopUpdateDto extends PartialType(UserShopCreateDto) {}
