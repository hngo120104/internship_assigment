import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartsRepository } from '../repositories/carts.repository';
import { CartItemsRepository } from '../repositories/cart.items.repository';
import { Transactional } from 'typeorm-transactional';
import { CartItemsAddRequestDto } from '../dto/cart.items.add.request.dto';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { Cart } from '../entities/cart.entity';
import { CartItemsUpdateRequestDto } from '../dto/cart.items.update.request.dto';
import { CartResponseDto } from '../dto/cart.response.dto';
import { plainToInstance } from 'class-transformer';
import { CartItem } from '../entities/cart.item.entity';
import { CartItemResponseDto } from '../dto/cart.item.response.dto';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartsRepo: CartsRepository,
    private readonly cartItemsRepo: CartItemsRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async getActiveCart(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<Cart> {
    const foundUserActiveCart = await this.cartsRepo.getActiveCart(owner);

    if (!foundUserActiveCart) {
      throw new NotFoundException('Active user cart not found');
    }

    return foundUserActiveCart;
  }

  private async validateProduct(productId: string, quantity: number) {
    const foundProduct =
      await this.productsRepo.findActiveProductById(productId);

    if (!foundProduct) {
      throw new NotFoundException('Product does not exist.');
    }

    if (!foundProduct.isActive) {
      throw new BadRequestException('Unavailable product.');
    }

    if (foundProduct.amount < quantity) {
      throw new BadRequestException(
        `Not enough amount: ${foundProduct.amount}`,
      );
    }
    return foundProduct;
  }

  private async addNewItemQuantity(
    userCart: Cart,
    cartItemsAddRequestDto: CartItemsAddRequestDto,
  ) {
    const validatedProduct = await this.validateProduct(
      cartItemsAddRequestDto.productId,
      cartItemsAddRequestDto.quantity,
    );
    const existingItem = await this.cartItemsRepo.findCartItem(
      userCart.id,
      validatedProduct.id,
    );

    const newQuantity =
      (existingItem?.quantity ?? 0) + cartItemsAddRequestDto.quantity;

    if (newQuantity > validatedProduct.amount) {
      throw new BadRequestException(
        `Not enough amount: ${validatedProduct.amount}`,
      );
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
      await this.cartItemsRepo.saveCartItem(existingItem);
    } else {
      await this.cartItemsRepo.createCartItem(
        userCart,
        validatedProduct,
        newQuantity,
      );
    }
  }

  async updateItemNewQuantity(
    owner: { userId?: string; guestId?: string },
    cartItemsUpdateRequestDto: CartItemsUpdateRequestDto,
  ) {
    const userCart = await this.cartsRepo.getActiveCart(owner);
    if (!userCart) {
      throw new NotFoundException('Cart does not exist');
    }

    const cartItem = await this.cartItemsRepo.findCartItem(
      userCart.id,
      cartItemsUpdateRequestDto.productId,
    );

    if (!cartItem) {
      throw new NotFoundException('Product does not exist');
    }

    await this.validateProduct(
      cartItemsUpdateRequestDto.productId,
      cartItemsUpdateRequestDto.quantity,
    );

    cartItem.quantity = cartItemsUpdateRequestDto.quantity;
    await this.cartItemsRepo.saveCartItem(cartItem);

    const activeUserCart = await this.getActiveCart(owner);

    return this.toCartResponseDto(activeUserCart);
  }

  @Transactional()
  async addItemToCart(
    owner: { userId?: string; guestId?: string },
    cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartResponseDto> {
    const userCart = await this.cartsRepo.findOrCreateActiveCart(owner);

    await this.addNewItemQuantity(userCart, cartItemsAddRequestDto);

    const updatedCart = await this.getActiveCart(owner);

    if (!updatedCart) {
      throw new NotFoundException('Cart does not exist.');
    }

    return this.toCartResponseDto(updatedCart);
  }

  async removeCartItem(
    owner: { userId?: string; guestId?: string },
    productId: string,
  ) {
    const cart = await this.cartsRepo.findOrCreateActiveCart(owner);

    const cartItem = await this.cartItemsRepo.findCartItem(cart.id, productId);

    if (!cartItem) {
      throw new NotFoundException('Cart item does not exist.');
    }

    await this.cartItemsRepo.removeCartItem(cartItem);

    const userCart = await this.getActiveCart(owner);

    return this.toCartResponseDto(userCart);
  }

  private toCartResponseDto(cart: Cart): CartResponseDto {
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  private toCartItemResponseDto(cartItems: CartItem): CartItemResponseDto {
    return plainToInstance(CartItemResponseDto, cartItems, {
      excludeExtraneousValues: true,
    });
  }

  private toCartItemsResponseDto(cartItems: CartItem[]): CartItemResponseDto[] {
    return plainToInstance(CartItemResponseDto, cartItems, {
      excludeExtraneousValues: true,
    });
  }
}
