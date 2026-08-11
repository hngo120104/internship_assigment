import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { CartItemsAddDto } from '../dto/cart.items.add.dto';

import { UserCartResponseDto } from '../dto/cart.response.dto';
import { CartItemsService } from '../services/cart.items.service';
import { CartItemResponseDto } from '../dto/cart.item.response.dto';
import { CartItemsUpdateDto } from '../dto/cart.items.update.dto';

@Controller('api/carts')
export class CartsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Get()
  async getAllUserActiveCartItems(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserCartResponseDto> {
    return this.cartItemsService.getUserActiveCart(user.sub);
  }

  @Get('items/:cartItemId')
  async getCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('cartItemId') cartItemId: string,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.findActiveCartItemByUserIdAndCartItemIdOrThrow(
      user.sub,
      cartItemId,
    );
  }

  @Post('items')
  async createCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddDto: CartItemsAddDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.createNewCartItemOrAddQuantity(
      user.sub,
      cartItemsAddDto,
    );
  }

  @Patch('items/:cartItemId')
  async updateCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('cartItemId') cartItemId: string,
    @Body() cartItemsUpdateDto: CartItemsUpdateDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.updateExistCartItemQuantity(
      cartItemId,
      user.sub,
      cartItemsUpdateDto,
    );
  }

  @Delete('items/:cartItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.cartItemsService.deleteUserCartItemOrThrow(cartItemId, user.sub);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.cartItemsService.deleteAllUserCartItemsOrThrow(user.sub);
  }
}
