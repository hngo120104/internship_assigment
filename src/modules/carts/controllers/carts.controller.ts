import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { CartItemsAddRequestDto } from '../dto/request/cart.items.add.request.dto';

import { UserCartResponseDto } from '../dto/response/cart.response.dto';
import { CartItemsService } from '../services/cart.items.service';
import { CartItemResponseDto } from '../dto/response/cart.item.response.dto';
import { CartItemsUpdateRequestDto } from '../dto/request/cart.items.update.request.dto';
import { DeleteCountResponseDto } from '../../../common/dto/delete.count.response.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Get()
  async getUserActiveCart(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserCartResponseDto> {
    return this.cartItemsService.getUserActiveCart(user.sub);
  }

  @Post()
  async createCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.addCartItem(user.sub, cartItemsAddDto);
  }

  @Patch(':cartItemId')
  async updateCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('cartItemId') cartItemId: string,
    @Body() cartItemsUpdateDto: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.updateCartItemQuantity(
      cartItemId,
      user.sub,
      cartItemsUpdateDto,
    );
  }

  @Delete(':cartItemId')
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    return await this.cartItemsService.softDeleteUserCartItemOrThrow(
      cartItemId,
      user.sub,
    );
  }

  @Delete()
  async deleteCart(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    return await this.cartItemsService.softDeleteAllUserCartItemsOrThrow(
      user.sub,
    );
  }
}
