import { PartialType } from '@nestjs/mapped-types';
import { UserCreateRequestDto } from './user-create-request.dto';

export class UserUpdateDto extends PartialType(UserCreateRequestDto) {}
