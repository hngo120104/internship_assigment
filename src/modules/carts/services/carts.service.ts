import { Injectable, NotFoundException } from '@nestjs/common';
import { CartsRepository } from '../repositories/carts.repository';
import { Transactional } from 'typeorm-transactional';
import { CartItemsAddRequestDto } from '../dto/cart.items.add.request.dto';
import { Cart } from '../entities/cart.entity';
import { CartResponseDto } from '../dto/cart.response.dto';
import { plainToInstance } from 'class-transformer';
import { CartItemsService } from './cart.items.service';

import { CartItemsRepository } from '../repositories/cart.items.repository';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartsRepo: CartsRepository,
    private readonly cartItemsService: CartItemsService,
    private readonly cartItemsRepo: CartItemsRepository,
  ) {}

  async findActiveCarts(): Promise<CartResponseDto[]> {
    const activeCarts = await this.cartsRepo.findActiveCarts();
    console.log(activeCarts);
    return this.toCartsResponseDto(activeCarts);
  }

  async getCurrentUserActiveCart(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<CartResponseDto> {
    const foundUserActiveCart = await this.cartsRepo.getActiveCart(owner);

    if (!foundUserActiveCart) {
      throw new NotFoundException('Active user cart not found');
    }

    return this.toCartResponseDto(foundUserActiveCart);
  }

  async getCurrentUserActiveCartEntity(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<Cart> {
    const foundUserActiveCart = await this.cartsRepo.getActiveCart(owner);

    if (!foundUserActiveCart) {
      throw new NotFoundException('Active user cart not found');
    }

    return foundUserActiveCart;
  }

  @Transactional()
  async addItemToCart(
    owner: { userId?: string; guestId?: string },
    cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartResponseDto> {
    const userCart = await this.cartsRepo.findOrCreateActiveCart(owner);
    const cartItemExist =
      await this.cartItemsRepo.findCartItemByCartIdAndProductId(
        userCart.id,
        cartItemsAddRequestDto.productId,
      );

    if (!cartItemExist) {
      await this.cartItemsService.createCartItem(
        owner.userId!,
        cartItemsAddRequestDto,
      );
    } else {
      await this.cartItemsService.addExistCartItemQuantity(
        cartItemExist.id,
        cartItemsAddRequestDto,
      );
    }

    const updatedCart = await this.getCurrentUserActiveCartEntity(owner);

    return this.toCartResponseDto(updatedCart);
  }

  async deleteCart(userId: string) {
    const deletedCart = await this.cartsRepo.softDeleteCart(userId);
    await this.cartItemsService.deleteAllCartItemsInCart(deletedCart.id);
    if (!deletedCart) {
      throw new NotFoundException('User cart does not exist.');
    }
  }

  private toCartResponseDto(cart: Cart): CartResponseDto {
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  private toCartsResponseDto(carts: Cart[]): CartResponseDto[] {
    const res = plainToInstance(CartResponseDto, carts, {
      excludeExtraneousValues: true,
    });
    console.log(res);
    return res;
  }
}
