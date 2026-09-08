import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { ShopsService } from '../services/shops.service';
import { CurrentUser } from '../../../custom-decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../custom-decorators/current-user.decorator';
import { ShopUpdateRequestDto } from '../dto/shops/request/shop-update.request.dto';
import { ShopCreateRequestDto } from '../dto/shops/request/shop-create.request.dto';
import { ShopResponseDto } from '../dto/shops/response/shop.response.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { RoleType } from '../entities/role.entity';
import { DeleteCountResponseDto } from '../../../common/dto/delete-count.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get('active')
  @Roles(RoleType.ADMIN)
  async findAllActiveShops(
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ShopResponseDto>> {
    return await this.shopsService.findAllActiveShops(paginationRequest);
  }

  @Post('register')
  registerShop(
    @CurrentUser() user: CurrentUserPayload,
    @Body() shopCreateDto: ShopCreateRequestDto,
  ): Promise<ShopResponseDto> {
    return this.shopsService.createShop(user.userId, shopCreateDto);
  }

  @Patch()
  @Roles(RoleType.SELLER)
  async updateShopDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Body() shopUpdateDto: ShopUpdateRequestDto,
  ): Promise<ShopResponseDto> {
    return await this.shopsService.updateShopDetails(
      user.userId,
      shopUpdateDto,
    );
  }

  @Delete()
  @Roles(RoleType.SELLER)
  async deleteShop(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount = await this.shopsService.deleteShopOrThrow(user.userId);
    return new DeleteCountResponseDto(deletedCount);
  }
}
