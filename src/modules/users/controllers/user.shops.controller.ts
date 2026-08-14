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
import { UserShopUpdateRequestDto } from '../dto/user.shop/request/user.shop.update.request.dto';
import { UserShopCreateRequestDto } from '../dto/user.shop/request/user.shop.create.request.dto';
import { UserShopResponseDto } from '../dto/user.shop/response/user.shop.response.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';

@Controller('shops')
export class ShopsController {
  constructor(private readonly userShopService: UserShopService) {}

  @Post('register')
  registerShop(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<UserShopResponseDto> {
    return this.userShopService.createShop(user.sub, userShopCreateDto);
  }

  @Patch('me')
  @Roles(Role.SELLER)
  async updateShopDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopUpdateDto: UserShopUpdateRequestDto,
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
    await this.userShopService.deleteShopOrThrow(user.sub);
  }
}
