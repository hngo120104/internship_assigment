import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { UserShopService } from '../services/user.shop.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { UserShopUpdateRequestDto } from '../dto/user.shop/request/user.shop.update.request.dto';
import { UserShopCreateRequestDto } from '../dto/user.shop/request/user.shop.create.request.dto';
import { UserShopResponseDto } from '../dto/user.shop/response/user.shop.response.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { DeleteCountResponseDto } from '../../../common/dto/delete.count.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly userShopService: UserShopService) {}

  @Get('active')
  @Roles(Role.ADMIN)
  async findManyActiveShops(
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<UserShopResponseDto>> {
    return await this.userShopService.findManyActiveShops(paginationRequest);
  }

  @Post('register')
  registerShop(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<UserShopResponseDto> {
    return this.userShopService.createShop(user.userId, userShopCreateDto);
  }

  @Patch()
  @Roles(Role.SELLER)
  async updateShopDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopUpdateDto: UserShopUpdateRequestDto,
  ): Promise<UserShopResponseDto> {
    return await this.userShopService.updateShopDetails(
      user.userId,
      userShopUpdateDto,
    );
  }

  @Delete()
  @Roles(Role.SELLER)
  async deleteShop(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount = await this.userShopService.deleteShopOrThrow(
      user.userId,
    );
    return new DeleteCountResponseDto(deletedCount);
  }
}
