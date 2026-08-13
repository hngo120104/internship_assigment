import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { UserPhotosInsertRequestDto } from '../../user.photos/request/user.photos.insert.request.dto';

export class UserCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'user_name' })
  userName!: string;

  @IsEmail({}, { message: 'Email required.' })
  @IsNotEmpty()
  email!: string;

  @Matches(/((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. Must include uppercase, lowercase, and a number and special character.',
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is at least 8 characters.' })
  password!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPhotosInsertRequestDto)
  photos?: UserPhotosInsertRequestDto[];
}
