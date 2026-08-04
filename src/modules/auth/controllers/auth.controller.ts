import { Controller, Post, Body } from '@nestjs/common';
import { LoginRequestDto } from '../dto/login.request.dto';
import { Public } from '../public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() body: LoginRequestDto) {
    return this.authService.login(body);
  }
}
