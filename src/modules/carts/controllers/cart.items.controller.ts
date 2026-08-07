import {
  Controller,
  Param,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartItemsService } from '../services/cart.items.service';
import { CartItemResponseDto } from '../dto/cart.item.response.dto';
import { CartItemsUpdateDto } from '../dto/cart.items.update.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { CartItemsAddDto } from '../dto/cart.items.add.dto';

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
    @Body() cartItemsAddDto: CartItemsAddDto,
  ): Promise<CartItemResponseDto> {
    return await this.cartItemsService.createCartItem(
      user.sub,
      cartItemsAddDto,
    );
  }

  @Patch(':cartItemId')
  async updateCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('cartItemId') cartItemId: string,
    @Body() cartItemsUpdateDto: CartItemsUpdateDto,
  ): Promise<CartItemResponseDto> {
    return await this.cartItemsService.updateExistCartItemQuantity(
      cartItemId,
      user.sub,
      cartItemsUpdateDto,
    );
  }

  @Delete(':cartItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.cartItemsService.deleteCartItemInCart(cartItemId, user.sub);
  }
}
