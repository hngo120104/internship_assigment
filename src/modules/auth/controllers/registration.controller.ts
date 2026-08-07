import { Body, Controller, Post, Request } from '@nestjs/common';

import { UserCreateDto } from '../../users/dto/users/user.create.dto';
import { UserCreateResponseDto } from '../../users/dto/users/user.create.response.dto';
import { Public } from '../public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('api/users')
export class RegistrationController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<UserCreateResponseDto> {
    return this.authService.registerUser(userCreateDto);
  }
}
