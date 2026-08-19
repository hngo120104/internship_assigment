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
import { toResponseDto } from '../../../utils/to.dto.response';
import { DeleteCountResponseDto } from '../../../common/dto/delete.count.response.dto';

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

  async findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate(
    userId: string,
    variantIds: string[],
    expectedCount: number,
  ): Promise<CartItem[]> {
    const foundLockedCartItems =
      await this.cartItemsRepo.findActiveCartItemsByUserIdAndVariantIdsAndLock(
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

  private async findAllUserActiveCartItemEntitiesByUserIdOrThrow(
    userId: string,
  ): Promise<CartItem[]> {
    const foundCartItems =
      await this.cartItemsRepo.findAllUserActiveCartItemsByUserId(userId);
    if (foundCartItems.length === 0) {
      throw new NotFoundException('Cart items not found.');
    }
    return foundCartItems;
  }

  private async findActiveCartItemEntityByUserIdAndCartItemIdOrThrow(
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

  private async findActiveCartItemEntityByUserIdAndVariantIdOrThrow(
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

  async findAllActiveUserCarts(
    page: number,
    limit: number,
  ): Promise<UserCartResponseDto[]> {
    const activeCartItems =
      await this.cartItemsRepo.findAllActiveCartItemsPaginated(page, limit);
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
  async addCartItem(
    userId: string,
    cartItemsAddDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    const foundLockedCartItem =
      await this.cartItemsRepo.findActiveCartItemByUserIdAndVariantIdAndLockForUpdate(
        userId,
        cartItemsAddDto.variantId,
      );
    if (foundLockedCartItem) {
      return await this.increaseCartItemQuantity(
        cartItemsAddDto,
        foundLockedCartItem,
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

  private async increaseCartItemQuantity(
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

  @Transactional()
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

  async userSoftDeleteUserCartItemOrThrow(
    cartItemId: string,
    userId: string,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount = await this.cartItemsRepo.userSoftDeleteCartItem(
      userId,
      cartItemId,
    );
    if (deletedCount !== 1) {
      throw new NotFoundException(
        'Cart item does not exist or is already deleted.',
      );
    }
    return new DeleteCountResponseDto(deletedCount);
  }

  async softDeleteAllUserCartItemsOrThrow(
    userId: string,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount =
      await this.cartItemsRepo.softDeleteAllCartItemsOfUser(userId);
    if (deletedCount === 0) {
      throw new NotFoundException('Cart items do not exist or are deleted.');
    }
    return new DeleteCountResponseDto(deletedCount);
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

  async cleanupAbandonedCartItems(): Promise<number> {
    const MONTH_THRESHOLD = 1000 * 10;
    const cutoffDate = new Date(Date.now() - MONTH_THRESHOLD);
    console.log('Cleaning up...');
    const deleteCount =
      await this.cartItemsRepo.softDeleteAbandonedCartItems(cutoffDate);
    return deleteCount;
  }
}
