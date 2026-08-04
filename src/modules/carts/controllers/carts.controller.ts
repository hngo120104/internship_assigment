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
import { CartsService } from '../services/carts.service';
import { CartItemsAddRequestDto } from '../dto/cart.items.add.request.dto';
import { CartItemsUpdateRequestDto } from '../dto/cart.items.update.request.dto';

import { CartResponseDto } from '../dto/cart.response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('api/carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getUserActiveCart(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CartResponseDto> {
    const cart = await this.cartsService.getActiveCart({
      userId: user.sub,
    });
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Post('items')
  async addItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartsService.addItemToCart(
      { userId: user.sub },
      cartItemsAddRequestDto,
    );
    return cart;
  }

  @Patch('items')
  async updateItemQuantity(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsUpdateRequestDto: CartItemsUpdateRequestDto,
  ): Promise<CartResponseDto | null> {
    const cart = await this.cartsService.updateItemNewQuantity(
      { userId: user.sub },
      cartItemsUpdateRequestDto,
    );
    return cart;
  }

  @Delete('items/:productId')
  async removeItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') productId: string,
  ): Promise<CartResponseDto | null> {
    const cart = await this.cartsService.removeCartItem(
      { userId: user.sub },
      productId,
    );
    return cart;
  }
}
