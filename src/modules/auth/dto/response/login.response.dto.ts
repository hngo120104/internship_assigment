import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../../users/dto/users/response/user.response.dto';

export class LoginResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;

  @Expose({ name: 'access_token' }) accessToken!: string;
}
