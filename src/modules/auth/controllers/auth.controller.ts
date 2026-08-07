import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
