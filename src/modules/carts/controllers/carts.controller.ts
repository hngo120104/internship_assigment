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
import { CartItemsAddRequestDto } from '../dto/request/cart.items.add.request.dto';

import { UserCartResponseDto } from '../dto/response/cart.response.dto';
import { CartItemsService } from '../services/cart.items.service';
import { CartItemResponseDto } from '../dto/response/cart.item.response.dto';
import { CartItemsUpdateRequestDto } from '../dto/request/cart.items.update.request.dto';
import { CartItemDeleteResponseDto } from '../dto/response/cart.item.delete.response.dto';

@Controller('api/carts')
export class CartsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Get()
  async getAllUserActiveCartItems(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserCartResponseDto> {
    return this.cartItemsService.getUserActiveCart(user.sub);
  }

  @Post()
  async createCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() cartItemsAddDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.createNewCartItemOrAddQuantity(
      user.sub,
      cartItemsAddDto,
    );
  }

  @Patch(':cartItemId')
  async updateCartItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('cartItemId') cartItemId: string,
    @Body() cartItemsUpdateDto: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    return this.cartItemsService.updateExistCartItemQuantity(
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
  ): Promise<CartItemDeleteResponseDto> {
    return await this.cartItemsService.deleteUserCartItemOrThrow(
      cartItemId,
      user.sub,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CartItemDeleteResponseDto> {
    return await this.cartItemsService.deleteAllUserCartItemsOrThrow(user.sub);
  }
}
