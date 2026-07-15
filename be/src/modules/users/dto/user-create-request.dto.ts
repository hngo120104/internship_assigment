import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsEmail,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Photo } from '../entities/photo.entities';
import { Role } from '../../auth/guards/role/role.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserCreateRequestDto {
  @IsString() @IsNotEmpty() @Expose() username!: string;
  // @IsString() full_name?: string;
  @IsEmail({}, { message: 'Email required.' }) @IsNotEmpty() @Expose() email!: string;
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. Must include uppercase, lowercase, and a number/special character.',
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is at least 8 characters.' })
  password!: string;
  @IsEnum(Role) @IsNotEmpty() @Expose() role!: Role;
  @IsOptional() @IsArray() @Expose() photos?: Partial<Photo>[];
}
