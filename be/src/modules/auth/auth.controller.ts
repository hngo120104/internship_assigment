import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { Public } from './public.decorator';
import { AuthGuard } from './guards/auth/auth.guard';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  Login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @Public()
  Register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
