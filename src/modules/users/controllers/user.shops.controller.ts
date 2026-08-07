import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserShopService } from '../services/user.shop.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { UserShopUpdateDto } from '../dto/user.shop/user.shop.update.dto';
import { UserShopCreateDto } from '../dto/user.shop/user.shop.create.dto';
import { UserShopResponseDto } from '../dto/user.shop/user.shop.response.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';

@Controller('api/shops')
export class ShopsController {
  constructor(private readonly userShopService: UserShopService) {}

  @Post('register')
  registerShop(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopCreateDto: UserShopCreateDto,
  ): Promise<UserShopResponseDto> {
    return this.userShopService.createShop(user.sub, userShopCreateDto);
  }

  @Patch('me')
  @Roles(Role.SELLER)
  async updateShopDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopUpdateDto: UserShopUpdateDto,
  ): Promise<UserShopResponseDto> {
    return await this.userShopService.updateShopDetails(
      user.sub,
      userShopUpdateDto,
    );
  }

  @Delete()
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShop(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.userShopService.deleteShop(user.sub);
  }
}
