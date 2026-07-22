import {
  Controller,
  Get,
  Post,
  Body,
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
import { UserShopCreateRequestDto } from '../users/dto/user.shop.create.request.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  login(@Body() body: LoginRequestDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.OK)
  createUser(
    @Body() userCreateRequestDto: UserCreateRequestDto,
  ): Promise<{ access_token: string }> {
    return this.authService.userRegister(userCreateRequestDto);
  }

  @Post('register/shop')
  @UseGuards(AuthGuard)
  createShop(
    @Request() req,
    @Body() userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<{ access_token: string }> {
    const userId = req.user.sub;
    return this.authService.shopRegister(userId, userShopCreateRequestDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
