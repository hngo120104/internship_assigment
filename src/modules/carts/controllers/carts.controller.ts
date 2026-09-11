import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../custom-decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../custom-decorators/current-user.decorator';
import { CartItemsAddRequestDto } from '../dto/request/cart-items-add.request.dto';

import { UserCartResponseDto } from '../dto/response/cart.response.dto';
import { CartItemsService } from '../services/cart-items.service';
import { CartItemResponseDto } from '../dto/response/cart-item.response.dto';
import { CartItemsUpdateRequestDto } from '../dto/request/cart-items-update.request.dto';
import { DeleteCountResponseDto } from '../../../common/dto/delete-count.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Get(':userId')
  async findUserCartItemsByUserId(
    @Query('userId') userId: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<ListResponseDto<UserCartResponseDto>> {
    return this.cartItemsService.findAllCartItemsByUserId(
      userId,
      paginationQueryDto.page,
      paginationQueryDto.size,
    );
  }

  @Get()
  async getUserActiveCart(
    @CurrentUser() user: CurrentUserPayload,
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<ListResponseDto<UserCartResponseDto>> {
    return this.cartItemsService.getUserActiveCart(
      user.userId,
      paginationQueryDto.page,
      paginationQueryDto.size,
    );
  }

  @Post()
  async createCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.addCartItem(user.userId, cartItemsAddDto);
  }

  @Patch(':cartItemId')
  async updateCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('cartItemId') cartItemId: string,
    @Body() cartItemsUpdateDto: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.updateCartItemQuantity(
      cartItemId,
      user.userId,
      cartItemsUpdateDto,
    );
  }

  @Delete(':cartItemId')
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    return await this.cartItemsService.userSoftDeleteUserCartItemOrThrow(
      cartItemId,
      user.userId,
    );
  }

  @Delete()
  async deleteCart(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    return await this.cartItemsService.softDeleteAllUserCartItemsOrThrow(
      user.userId,
    );
  }
}
