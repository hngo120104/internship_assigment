import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { CartsService } from '../services/carts.service';
import { CartItemsAddRequestDto } from '../dto/cart.items.add.request.dto';

import { CartResponseDto } from '../dto/cart.response.dto';
import { CartItemsService } from '../services/cart.items.service';

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
    @Body() cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartsService.addItemToCart(
      { userId: user.sub },
      cartItemsAddRequestDto,
    );
    return cart;
  }

  @Delete('me/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@CurrentUser() user: CurrentUserPayload) {
    await this.cartsService.deleteCart(user.sub);
  }
}
