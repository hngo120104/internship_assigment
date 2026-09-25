import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartItemsRepository } from '../repositories/cart-items.repository';
import { CartItemResponseDto } from '../dto/response/cart-item.response.dto';
import { CartItem } from '../entities/cart-item.entity';
import { CartItemsAddRequestDto } from '../dto/request/cart-items-add.request.dto';
import { ProductVariantsService } from '../../products/services/product-variants.service';
import { CartItemsUpdateRequestDto } from '../dto/request/cart-items-update.request.dto';
import { UserCartResponseDto } from '../dto/response/cart.response.dto';
import { Transactional } from 'typeorm-transactional';
import { toResponseDto } from '../../../utils/response-dto.mapper';
import { DeleteCountResponseDto } from '../../../common/dto/delete-count.response.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Injectable()
export class CartItemsService {
  constructor(
    private readonly cartItemsRepository: CartItemsRepository,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  async findAllCartItemsByUserId(
    userId: string,
    page: number,
    size: number,
  ): Promise<ListResponseDto<UserCartResponseDto>> {
    const [foundUserCartItems, count] =
      await this.cartItemsRepository.findAllUserActiveCartItemsByUserId(
        userId,
        page,
        size,
      );
    const userCartObj = {
      userId: userId,
      cartItems: foundUserCartItems,
    };
    const response = toResponseDto(UserCartResponseDto, userCartObj);
    return new ListResponseDto([response], count, page, size);
  }

  async getUserActiveCart(
    userId: string,
    page: number,
    size: number,
  ): Promise<ListResponseDto<UserCartResponseDto>> {
    const [foundUserActiveCartItems, count] =
      await this.findAllUserActiveCartItemEntitiesByUserId(userId, page, size);
    const userCartObj = {
      userId: userId,
      cartItems: foundUserActiveCartItems,
    };
    const response = toResponseDto(UserCartResponseDto, userCartObj);
    return new ListResponseDto([response], count, size, page);
  }

  async findActiveCartItemsEntitiesByUserIdAndIdsOrThrow(
    userId: string,
    cartItemIds: string[],
    expectedCount: number,
  ): Promise<CartItem[]> {
    const cartItems =
      await this.cartItemsRepository.findActiveCartItemsByUserIdAndIds(
        userId,
        cartItemIds,
      );
    if (cartItems.length !== expectedCount) {
      throw new BadRequestException('One or more cart items not found.');
    }
    return cartItems;
  }

  private async findAllUserActiveCartItemEntitiesByUserId(
    userId: string,
    page: number,
    size: number,
  ): Promise<[CartItem[], number]> {
    return await this.cartItemsRepository.findAllUserActiveCartItemsByUserId(
      userId,
      page,
      size,
    );
  }

  private async findActiveCartItemEntityByUserIdAndCartItemIdOrThrow(
    userId: string,
    cartItemId: string,
  ): Promise<CartItem> {
    const activeCartItem =
      await this.cartItemsRepository.findActiveCartItemByUserIdAndCartItemId(
        userId,
        cartItemId,
      );
    if (!activeCartItem)
      throw new NotFoundException(`User's cart item not found.`);
    return activeCartItem;
  }

  private async findActiveCartItemEntityByUserIdAndVariantIdOrThrow(
    userId: string,
    variantId: string,
  ): Promise<CartItem> {
    const activeCartItem =
      await this.cartItemsRepository.findActiveCartItemByUserIdAndVariantId(
        userId,
        variantId,
      );
    if (!activeCartItem) throw new NotFoundException('Cart item not found.');
    return activeCartItem;
  }

  @Transactional()
  async addCartItem(
    userId: string,
    cartItemsAddDto: CartItemsAddRequestDto,
  ): Promise<CartItemResponseDto> {
    const activeCartItem =
      await this.cartItemsRepository.findActiveCartItemByUserIdAndVariantId(
        userId,
        cartItemsAddDto.variantId,
      );
    if (activeCartItem) {
      return await this.increaseCartItemQuantity(
        cartItemsAddDto,
        activeCartItem,
      );
    }

    await this.cartItemsRepository.createCartItem(
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

  private validateVariantAmount(amountUpdate: number, availableAmount: number) {
    const allowedAmount = Math.min(
      availableAmount,
      Number(process.env.MAX_CART_ITEMS) || 100,
    );
    if (amountUpdate > allowedAmount) {
      if (allowedAmount > availableAmount) {
        throw new BadRequestException(`Available amount is ${availableAmount}`);
      }
      throw new BadRequestException(`Max allowed amount is ${allowedAmount}`);
    }
  }

  private async increaseCartItemQuantity(
    cartItemsAddDto: CartItemsAddRequestDto,
    cartItem: CartItem,
  ): Promise<CartItemResponseDto> {
    const totalQuantity = cartItem.quantity + cartItemsAddDto.quantity;

    const availableAmount =
      await this.productVariantsService.getVariantAvailableAmount(
        cartItem.variantId,
      );

    this.validateVariantAmount(totalQuantity, availableAmount);

    cartItem.quantity = totalQuantity;
    await this.cartItemsRepository.saveCartItem(cartItem);
    return toResponseDto(CartItemResponseDto, cartItem);
  }

  async updateCartItemQuantity(
    cartItemId: string,
    userId: string,
    cartItemsUpdateDto: CartItemsUpdateRequestDto,
  ): Promise<CartItemResponseDto> {
    const activeCartItemBelongsToUser =
      await this.findActiveCartItemEntityByUserIdAndCartItemIdOrThrow(
        userId,
        cartItemId,
      );
    const amountUpdate = cartItemsUpdateDto.quantity;
    const availableAmount =
      await this.productVariantsService.getVariantAvailableAmount(
        activeCartItemBelongsToUser.variantId,
      );
    this.validateVariantAmount(amountUpdate, availableAmount);
    const updateResult =
      await this.cartItemsRepository.updateUserCartItemQuantity(
        userId,
        cartItemId,
        amountUpdate,
      );
    if (!updateResult) {
      throw new NotFoundException('Cart item not found or already updated.');
    }
    const updatedCartItem =
      await this.findActiveCartItemEntityByUserIdAndCartItemIdOrThrow(
        userId,
        cartItemId,
      );
    return toResponseDto(CartItemResponseDto, updatedCartItem);
  }

  async userSoftDeleteUserCartItemOrThrow(
    cartItemId: string,
    userId: string,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount = await this.cartItemsRepository.userSoftDeleteCartItem(
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
      await this.cartItemsRepository.softDeleteAllCartItemsOfUser(userId);
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
      await this.cartItemsRepository.markUserActiveCartItemsAsOrdered(
        userId,
        cartItemIds,
      );
    if (cartItemIds.length !== updatedCount) {
      throw new NotFoundException('Some cart items are no longer active.');
    }
    return updatedCount;
  }

  async cleanupAbandonedCartItems(): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - Number(process.env.MONTH_THRESHOLD),
    );
    const deleteCount =
      await this.cartItemsRepository.softDeleteAbandonedCartItems(cutoffDate);
    return deleteCount;
  }
}
