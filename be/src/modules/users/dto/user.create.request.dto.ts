import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserPhotosInsertRequestDto } from './user.photos.insert.request.dto';
import { Role } from '../../auth/guards/role/role.enum';

export class UserCreateRequestDto {
  @IsString() @IsNotEmpty() username!: string;
  @IsEmail({}, { message: 'Email required.' }) @IsNotEmpty() email!: string;
  @Matches(/((?=.*\d)&(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. Must include uppercase, lowercase, and a number and special character.',
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is at least 8 characters.' })
  password!: string;
  @IsEnum(Role) @IsNotEmpty() role!: Role;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPhotosInsertRequestDto)
  photos?: UserPhotosInsertRequestDto[];
}
