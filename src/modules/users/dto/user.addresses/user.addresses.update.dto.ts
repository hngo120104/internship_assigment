import { PartialType } from '@nestjs/mapped-types';
import { UserAddressesCreateDto } from './user.addresses.create.dto';

export class UserAddressesUpdateDto extends PartialType(
  UserAddressesCreateDto,
) {}
