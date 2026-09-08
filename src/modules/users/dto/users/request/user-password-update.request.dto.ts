import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserPasswordUpdateRequestDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'new_password' })
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'old_password' })
  oldPassword!: string;
}
