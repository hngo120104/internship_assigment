import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartItemsRepository } from '../repositories/cart.items.repository';
import { CartItemResponseDto } from '../dto/response/cart.item.response.dto';
import { CartItem } from '../entities/cart.item.entity';
import { CartItemsAddRequestDto } from '../dto/request/cart.items.add.request.dto';
import { ProductVariantsService } from '../../products/services/product.variants.service';
import { CartItemsUpdateRequestDto } from '../dto/request/cart.items.update.request.dto';
import { UserCartResponseDto } from '../dto/response/cart.response.dto';
import { Transactional } from 'typeorm-transactional';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import { CartItemDeleteResponseDto } from '../dto/response/cart.item.delete.response.dto';

@Injectable()
export class CartItemsService {
  constructor(
    private readonly cartItemsRepo: CartItemsRepository,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  async getUserActiveCart(userId: string): Promise<UserCartResponseDto> {
    const foundUserActiveCartItems =
      await this.findAllUserActiveCartItemEntitiesByUserIdOrThrow(userId);
    const userCartObj = {
      userId: userId,
      cartItems: foundUserActiveCartItems,
    };
    return toResponseDto(UserCartResponseDto, userCartObj);
  }

  async findActiveCartItemEntityByUserIdAndVariantIdAndLockForBuyNowOrThrow(
    userId: string,
    variantId: string,
  ): Promise<CartItem> {
    const foundLockedCartItem =
      await this.cartItemsRepo.findActiveCartItemByUserIdAndVariantIdAndLockForBuyNow(
        userId,
        variantId,
      );
    if (!foundLockedCartItem) {
      throw new NotFoundException('User cart item not found.');
    }
    return foundLockedCartItem;
  }

  async findAllActiveCartItemsEntitiesByUserIdAndVariantIdsAndLockForCheckoutOrThrow(
    userId: string,
    variantIds: string[],
    expectedCount: number,
  ): Promise<CartItem[]> {
    const foundLockedCartItems =
      await this.cartItemsRepo.findActiveCartItemsByUserIdAndVariantIdsAndLockForCheckOut(
        userId,
        variantIds,
      );
    if (!foundLockedCartItems.length) {
      throw new NotFoundException('No user cart item found.');
    }
    if (foundLockedCartItems.length !== expectedCount) {
      throw new BadRequestException('One or more cart items not found.');
    }
    return foundLockedCartItems;
  }

  async findActiveCartItemsEntitiesOfUserByCartItemIdsOrThrow(
    userId: string,
    cartItemIds: string[],
  ): Promise<CartItem[]> {
    const foundCartItems =
      await this.cartItemsRepo.findActiveCartItemsOfUserByCartItemIds(
        userId,
        cartItemIds,
      );
    if (foundCartItems.length !== cartItemIds.length) {
      throw new BadRequestException('One or more of cart items not found.');
    }
    return foundCartItems;
  }

  async findAllUserActiveCartItemsByUserIdOrThrow(
    userId: string,
  ): Promise<CartItemResponseDto[]> {
    const foundCartItems =
      await this.cartItemsRepo.findAllUserActiveCartItemsByUserId(userId);
    if (foundCartItems.length === 0) {
      throw new NotFoundException('Cart items not found.');
    }
    return toListResponseDtos(CartItemResponseDto, foundCartItems);
  }

  async findAllUserActiveCartItemEntitiesByUserIdOrThrow(
    userId: string,
  ): Promise<CartItem[]> {
    const foundCartItems =
      await this.cartItemsRepo.findAllUserActiveCartItemsByUserId(userId);
    if (foundCartItems.length === 0) {
      throw new NotFoundException('Cart items not found.');
    }
    return foundCartItems;
  }

  async findActiveCartItemByUserIdAndCartItemIdOrThrow(
    userId: string,
    cartItemId: string,
  ): Promise<CartItemResponseDto> {
    const foundCartItem =
      await this.cartItemsRepo.findActiveCartItemByUserIdAndCartItemId(
        userId,
        cartItemId,
      );
    if (!foundCartItem) throw new NotFoundException('Cart item not found.');
    return toResponseDto(CartItemResponseDto, foundCartItem);
  }

  async findActiveCartItemEntityByUserIdAndCartItemIdOrThrow(
    userId: string,
    cartItemId: string,
  ): Promise<CartItem> {
    const foundCartItem =
      await this.cartItemsRepo.findActiveCartItemByUserIdAndCartItemId(
        userId,
        cartItemId,
      );
    if (!foundCartItem)
      throw new NotFoundException(`User's cart item not found.`);
    return foundCartItem;
  }

  async findActiveCartItemEntityByUserIdAndVariantIdOrThrow(
    userId: string,
    variantId: string,
  ): Promise<CartItem> {
    const foundCartItem =
      await this.cartItemsRepo.findActiveCartItemByUserIdAndVariantId(
        userId,
        variantId,
      );
    if (!foundCartItem) throw new NotFoundException('Cart item not found.');
    return foundCartItem;
  }

  async findAllActiveUserCarts(): Promise<UserCartResponseDto[]> {
    const activeCartItems = await this.cartItemsRepo.findAllActiveCartItems();
    const itemsByUserId = new Map<string, CartItem[]>();

    for (const cartItem of activeCartItems) {
      const userCartItems = itemsByUserId.get(cartItem.userId) ?? [];
      userCartItems.push(cartItem);
      itemsByUserId.set(cartItem.userId, userCartItems);
    }

    return [...itemsByUserId].map(([userId, cartItems]) =>
      toResponseDto(UserCartResponseDto, { userId, cartItems }),
    );
  }

  @Transactional()
  async addCartItemOrAddQuantity(
    userId: string,
    cartItemsAddDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    const createdCartItemExist =
      await this.cartItemsRepo.findActiveCartItemByUserIdAndVariantId(
        userId,
        cartItemsAddDto.variantId,
      );
    if (createdCartItemExist) {
      return await this.increaseCartItemQuantity(
        cartItemsAddDto,
        createdCartItemExist,
      );
    }
    await this.productVariantsService.validateVariantQuantity(
      cartItemsAddDto.variantId,
      cartItemsAddDto.quantity,
    );
    await this.cartItemsRepo.createCartItem(
      userId,
      cartItemsAddDto.variantId,
      cartItemsAddDto.quantity,
    );

    const newCartItem =
      await this.findActiveCartItemEntityByUserIdAndVariantIdOrThrow(
        userId,
        cartItemsAddDto.variantId,
      );
    return toResponseDto(CartItemResponseDto, newCartItem);
  }

  async increaseCartItemQuantity(
    cartItemsAddDto: CartItemsAddRequestDto,
    cartItem: CartItem,
  ): Promise<CartItemResponseDto> {
    const totalQuantity = cartItem.quantity + cartItemsAddDto.quantity;

    await this.productVariantsService.validateVariantQuantity(
      cartItemsAddDto.variantId,
      totalQuantity,
    );

    cartItem.quantity = totalQuantity;
    await this.cartItemsRepo.saveCartItem(cartItem);
    return toResponseDto(CartItemResponseDto, cartItem);
  }

  async updateCartItemQuantity(
    cartItemId: string,
    userId: string,
    cartItemsUpdateDto: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    const foundCartItemBelongsToUser =
      await this.findActiveCartItemEntityByUserIdAndCartItemIdOrThrow(
        userId,
        cartItemId,
      );
    const updatedQuantity = cartItemsUpdateDto.quantity;

    await this.productVariantsService.validateVariantQuantity(
      foundCartItemBelongsToUser.variantId,
      updatedQuantity,
    );
    foundCartItemBelongsToUser.quantity = updatedQuantity;

    const updatedCartItem = await this.cartItemsRepo.saveCartItem(
      foundCartItemBelongsToUser,
    );
    return toResponseDto(CartItemResponseDto, updatedCartItem);
  }

  async findUserActiveCartItemOrThrow(
    userId: string,
    variantId: string,
  ): Promise<CartItemResponseDto> {
    const foundCartItem =
      await this.findActiveCartItemEntityByUserIdAndVariantIdOrThrow(
        userId,
        variantId,
      );

    return toResponseDto(CartItemResponseDto, foundCartItem);
  }

  async deleteUserCartItemOrThrow(
    cartItemId: string,
    userId: string,
  ): Promise<CartItemDeleteResponseDto> {
    const deletedCount = await this.cartItemsRepo.softDeleteCartItem(
      userId,
      cartItemId,
    );
    if (deletedCount !== 1) {
      throw new NotFoundException(
        'Cart item does not exist or is already deleted.',
      );
    }
    return toResponseDto(CartItemDeleteResponseDto, {
      deletedAmount: deletedCount,
      message: 'Success',
    });
  }

  async deleteAllUserCartItemsOrThrow(
    userId: string,
  ): Promise<CartItemDeleteResponseDto> {
    const deletedCount =
      await this.cartItemsRepo.softDeleteAllCartItemsOfUser(userId);
    if (deletedCount === 0) {
      throw new NotFoundException('Cart items do not exist or are deleted.');
    }
    return toResponseDto(CartItemDeleteResponseDto, {
      deletedAmount: deletedCount,
      message: 'Success',
    });
  }

  async markUserCartItemsAsOrderedOrThrow(
    userId: string,
    cartItemIds: string[],
  ): Promise<number> {
    const updatedCount =
      await this.cartItemsRepo.markActiveCartItemsOfUserAsOrdered(
        userId,
        cartItemIds,
      );
    if (cartItemIds.length !== updatedCount) {
      throw new NotFoundException('Some cart items are no longer active.');
    }
    return updatedCount;
  }

  async markAllUserCartItemsAsOrderedOrThrow(
    userId: string,
    expectedCount: number,
  ): Promise<number> {
    const updatedCount =
      await this.cartItemsRepo.markAllActiveCartItemsOfUserAsOrdered(userId);
    if (updatedCount !== expectedCount) {
      throw new NotFoundException('Some cart items are no longer active.');
    }
    return updatedCount;
  }
}
