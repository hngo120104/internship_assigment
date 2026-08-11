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
import { CartsService } from '../services/carts.service';
import { CartItemsAddDto } from '../dto/cart.items.add.dto';

import { CartResponseDto } from '../dto/cart.response.dto';
import { CartItemsService } from '../services/cart.items.service';
import { CartItemResponseDto } from '../dto/cart.item.response.dto';
import { CartItemsUpdateDto } from '../dto/cart.items.update.dto';

@Controller('api/carts')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  @Get('me')
  async getUserActiveCart(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CartResponseDto> {
    const owner = {
      userId: user.sub,
      guestId: undefined,
    };
    return this.cartsService.getCurrentUserActiveCart(owner);
  }

  @Post('me')
  async addItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddDto: CartItemsAddDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartsService.addItemToCart(
      { userId: user.sub },
      cartItemsAddDto,
    );
    return cart;
  }

  @Get('items/:cartItemId')
  async getCartItem(
    @Param('cartItemId') cartItemId: string,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.findCartItemById(cartItemId);
  }

  @Post('items')
  async createCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddDto: CartItemsAddDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.createCartItem(user.sub, cartItemsAddDto);
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
    await this.cartItemsService.deleteCartItemInCart(cartItemId, user.sub);
  }

  @Delete('me/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.cartsService.deleteCart(user.sub);
  }
}
