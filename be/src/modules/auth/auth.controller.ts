import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LoginRequestDto } from './dto/login.request.dto';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth/auth.guard';
import { UserCreateRequestDto } from '../users/dto/user.create.request.dto';
import { UsersService } from '../users/services/users.service';
import { UserResponseDto } from '../users/dto/user.response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  Login(@Body() body: LoginRequestDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.OK)
  async createUser(
    @Body() userCreateRequestDto: UserCreateRequestDto,
  ): Promise<{ access_token: string }> {
    return await this.authService.register(userCreateRequestDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
