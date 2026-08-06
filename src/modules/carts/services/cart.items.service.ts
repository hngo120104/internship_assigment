import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartItemsRepository } from '../repositories/cart.items.repository';
import { CartItemResponseDto } from '../dto/cart.item.response.dto';
import { CartItem } from '../entities/cart.item.entity';
import { plainToInstance } from 'class-transformer';
import { CartItemsAddRequestDto } from '../dto/cart.items.add.request.dto';
import { ProductsService } from '../../products/services/products.service';
import { CartItemsUpdateRequestDto } from '../dto/cart.items.update.request.dto';
import { CartsRepository } from '../repositories/carts.repository';

@Injectable()
export class CartItemsService {
  constructor(
    private readonly cartItemsRepo: CartItemsRepository,
    private readonly productsService: ProductsService,
    private readonly cartsRepo: CartsRepository,
  ) {}

  async findCartItemById(cartItemId: string): Promise<CartItemResponseDto> {
    const foundCartItem = await this.cartItemsRepo.findCartItemById(cartItemId);
    if (!foundCartItem) throw new NotFoundException('Cart item not found.');
    return this.toCartItemResponseDto(foundCartItem);
  }

  async findCartItemEntityById(cartItemId: string): Promise<CartItem> {
    const foundCartItem = await this.cartItemsRepo.findCartItemById(cartItemId);
    if (!foundCartItem) throw new NotFoundException('Cart item not found.');
    return foundCartItem;
  }

  async findCartItemEntityByCartIdAndProductIdOrThrow(
    cartId: string,
    productId: string,
  ): Promise<CartItem> {
    const foundCartItem =
      await this.cartItemsRepo.findCartItemByCartIdAndProductId(
        cartId,
        productId,
      );
    if (!foundCartItem) throw new NotFoundException('Cart item not found.');
    return foundCartItem;
  }

  async findCartItemEntityByCartIdAndProductId(
    cartId: string,
    productId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo.findCartItemByCartIdAndProductId(
      cartId,
      productId,
    );
  }

  async getCartItemEntityById(cartItemId: string): Promise<CartItem> {
    const foundCartItem = await this.cartItemsRepo.findCartItemById(cartItemId);
    if (!foundCartItem) throw new NotFoundException('Cart item not found.');
    return foundCartItem;
  }

  async validateProductQuantity(productId: string, quantity: number) {
    const product =
      await this.productsService.findActiveProductEntityById(productId);
    if (product.amount < quantity) {
      throw new BadRequestException(
        `Your amount: ${quantity}. Product amount is not enough: ${product.amount}`,
      );
    }
  }

  async validateCartItemOfCart(
    userId: string,
    cartId: string,
  ): Promise<boolean> {
    const userCart = await this.cartsRepo.findCartByUserId(userId);
    if (!userCart) throw new NotFoundException('User does not have cart.');
    return userCart.id === cartId;
  }

  async createCartItem(
    userId: string,
    cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    await this.validateProductQuantity(
      cartItemsAddRequestDto.productId,
      cartItemsAddRequestDto.quantity,
    );

    const userCart = await this.cartsRepo.findCartByUserId(userId);
    if (!userCart) throw new NotFoundException('User does not have cart.');
    const createdCartItem = await this.cartItemsRepo.createCartItem(
      userCart.id,
      cartItemsAddRequestDto.productId,
      cartItemsAddRequestDto.quantity,
    );

    return this.toCartItemResponseDto(createdCartItem);
  }

  async addExistCartItemQuantity(
    cartItemId: string,
    cartItemsAddRequestDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    const foundCartItem = await this.findCartItemEntityById(cartItemId);
    const totalQuantity =
      foundCartItem.quantity + cartItemsAddRequestDto.quantity;

    await this.validateProductQuantity(
      cartItemsAddRequestDto.productId,
      totalQuantity,
    );

    foundCartItem.quantity = totalQuantity;
    await this.cartItemsRepo.saveCartItem(foundCartItem);
    return this.toCartItemResponseDto(foundCartItem);
  }

  async updateExistCartItemQuantity(
    cartItemId: string,
    cartItemsRequest: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    const foundCartItem = await this.findCartItemEntityById(cartItemId);
    const updatedQuantity = cartItemsRequest.quantity;

    await this.validateProductQuantity(
      cartItemsRequest.productId,
      updatedQuantity,
    );
    foundCartItem.quantity = updatedQuantity;

    const updatedCartItem =
      await this.cartItemsRepo.saveCartItem(foundCartItem);
    return this.toCartItemResponseDto(updatedCartItem);
  }

  async getCartItemInCart(
    cartId: string,
    productId: string,
  ): Promise<CartItemResponseDto> {
    const foundCartItem =
      await this.cartItemsRepo.findCartItemByCartIdAndProductId(
        cartId,
        productId,
      );

    if (!foundCartItem) throw new NotFoundException('Cart item not found.');

    return this.toCartItemResponseDto(foundCartItem);
  }

  async deleteCartItemInCart(cartItemId: string, userId: string) {
    await this.validateCartItemOfCart(cartItemId, userId);
    const cartItemToDelete =
      await this.cartItemsRepo.deleteCartItem(cartItemId);
    if (!cartItemToDelete)
      throw new NotFoundException('Cart item does not exists.');
  }

  async deleteAllCartItemsInCart(cartId: string): Promise<boolean> {
    const deleteSuccess = await this.cartItemsRepo.deleteAllCartItems(cartId);
    return deleteSuccess === true;
  }

  private toCartItemResponseDto(cartItem: CartItem): CartItemResponseDto {
    return plainToInstance(CartItemResponseDto, cartItem, {
      excludeExtraneousValues: true,
    });
  }

  private toCartItemsResponseDto(cartItems: CartItem[]): CartItemResponseDto[] {
    return plainToInstance(CartItemResponseDto, cartItems, {
      excludeExtraneousValues: true,
    });
  }
}
