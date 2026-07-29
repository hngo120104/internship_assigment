import { Body, Controller, Post, Request } from '@nestjs/common';

import { UserCreateRequestDto } from '../../users/dto/users/user.create.request.dto';
import { UserCreateResponseDto } from '../../users/dto/users/user.create.response.dto';
import { UserShopCreateRequestDto } from '../../users/dto/user.shop/user.shop.create.request.dto';
import { UserShopCreateResponseDto } from '../../users/dto/user.shop/user.shop.create.response.dto';
import { Public } from '../public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('api/users')
export class RegistrationController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(
    @Body() userCreateRequestDto: UserCreateRequestDto,
  ): Promise<UserCreateResponseDto> {
    return this.authService.registerUser(userCreateRequestDto);
  }

  @Post('register/shop')
  registerShop(
    @Request() req,
    @Body() userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<UserShopCreateResponseDto> {
    return this.authService.registerShop(
      req.user.sub,
      userShopCreateRequestDto,
    );
  }
}
