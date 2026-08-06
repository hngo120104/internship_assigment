import {
  Controller,
  Param,
  Get,
  Post,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { CartItemsService } from '../services/cart.items.service';
import { CartItemResponseDto } from '../dto/cart.item.response.dto';
import { CartItemsUpdateRequestDto } from '../dto/cart.items.update.request.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { CartItemsAddRequestDto } from '../dto/cart.items.add.request.dto';

@Controller('api/carts/items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Get(':cartItemId')
  async getCartItem(
    @Param('cartItemId') cartItemId: string,
  ): Promise<CartItemResponseDto> {
    return await this.cartItemsService.findCartItemById(cartItemId);
  }

  @Post()
  async createCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    return await this.cartItemsService.createCartItem(
      user.sub,
      cartItemsAddRequestDto,
    );
  }

  @Patch(':cartItemId')
  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() CartItemsUpdateRequestDto: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    return await this.cartItemsService.updateExistCartItemQuantity(
      cartItemId,
      CartItemsUpdateRequestDto,
    );
  }

  @Delete(':cartItemId')
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.cartItemsService.deleteCartItemInCart(cartItemId, user.sub);
  }
}
