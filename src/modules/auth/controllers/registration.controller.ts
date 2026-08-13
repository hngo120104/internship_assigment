import { Body, Controller, Post, Request } from '@nestjs/common';

import { UserCreateRequestDto } from '../../users/dto/users/request/user.create.request.dto';
import { UserCreateResponseDto } from '../../users/dto/users/response/user.create.response.dto';
import { Public } from '../public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('api/users')
export class RegistrationController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(
    @Body() userCreateDto: UserCreateRequestDto,
  ): Promise<UserCreateResponseDto> {
    return this.authService.registerUser(userCreateDto);
  }
}
