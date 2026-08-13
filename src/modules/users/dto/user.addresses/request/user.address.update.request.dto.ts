import { PartialType } from '@nestjs/mapped-types';
import { UserAddressCreateRequestDto } from './user.address.create.request.dto';

export class UserAddressUpdateRequestDto extends PartialType(
  UserAddressCreateRequestDto,
) {}
