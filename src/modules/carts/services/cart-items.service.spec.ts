import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantsService } from '../../products/services/product-variants.service';
import { CartItemsRepository } from '../repositories/cart-items.repository';
import { CartItemsService } from './cart-items.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('CartItemsService', () => {
  let service: CartItemsService;
  let cartItemsRepository: {
    findActiveCartItemByUserIdAndVariantId: jest.Mock;
    findActiveCartItemByUserIdAndVariantId: jest.Mock;
    createCartItem: jest.Mock;
    saveCartItem: jest.Mock;
    userSoftDeleteCartItem: jest.Mock;
    softDeleteAllCartItemsOfUser: jest.Mock;
  };
  let productsService: { validateVariantsQuantity: jest.Mock };

  beforeEach(async () => {
    cartItemsRepository = {
      findActiveCartItemByUserIdAndVariantId: jest.fn(),
      findActiveCartItemByUserIdAndVariantId: jest.fn(),
      createCartItem: jest.fn(),
      saveCartItem: jest.fn(),
      userSoftDeleteCartItem: jest.fn(),
      softDeleteAllCartItemsOfUser: jest.fn(),
    };
    productsService = { validateVariantsQuantity: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemsService,
        { provide: CartItemsRepository, useValue: cartItemsRepository },
        { provide: ProductVariantsService, useValue: productsService },
      ],
    }).compile();

    service = module.get<CartItemsService>(CartItemsService);
  });

  it('creates a new item when the product is not in the active cart', async () => {
    const createdItem = {
      id: 'cart-item-id',
      userId: 'user-id',
      variantId: 'variant-id',
      quantity: 2,
      variant: { price: 100, product: { id: 'product-id' } },
    };
    cartItemsRepository.findActiveCartItemByUserIdAndVariantId.mockResolvedValue(
      null,
    );
    cartItemsRepository.findActiveCartItemByUserIdAndVariantId.mockResolvedValue(
      createdItem,
    );
    cartItemsRepository.createCartItem.mockResolvedValue(createdItem);
    productsService.validateVariantsQuantity.mockResolvedValue(undefined);

    const result = await service.addCartItem('user-id', {
      variantId: 'variant-id',
      quantity: 2,
    });

    expect(productsService.validateVariantsQuantity).toHaveBeenCalledWith(
      'variant-id',
      2,
    );
    expect(cartItemsRepository.createCartItem).toHaveBeenCalledWith(
      'user-id',
      'variant-id',
      2,
    );
    expect(result.quantity).toBe(2);
    expect(result.lineTotal).toBe(200);
  });

  it('adds quantity when the product is already in the active cart', async () => {
    const existingItem = {
      id: 'cart-item-id',
      userId: 'user-id',
      variantId: 'variant-id',
      quantity: 2,
      variant: { price: 100, product: { id: 'product-id' } },
    };
    cartItemsRepository.findActiveCartItemByUserIdAndVariantId.mockResolvedValue(
      existingItem,
    );
    cartItemsRepository.saveCartItem.mockImplementation((cartItem: object) =>
      Promise.resolve(cartItem),
    );
    productsService.validateVariantsQuantity.mockResolvedValue(undefined);

    const result = await service.addCartItem('user-id', {
      variantId: 'variant-id',
      quantity: 3,
    });

    expect(productsService.validateVariantsQuantity).toHaveBeenCalledWith(
      'variant-id',
      5,
    );
    expect(cartItemsRepository.createCartItem).not.toHaveBeenCalled();
    expect(result.quantity).toBe(5);
    expect(result.lineTotal).toBe(500);
  });

  it('returns the deleted cart items response', async () => {
    cartItemsRepository.userSoftDeleteCartItem.mockResolvedValue(1);
    cartItemsRepository.softDeleteAllCartItemsOfUser.mockResolvedValue(3);

    await expect(
      service.userSoftDeleteUserCartItemOrThrow('cart-item-id', 'user-id'),
    ).resolves.toEqual({ deletedCount: 1, message: 'Success.' });
    await expect(
      service.softDeleteAllUserCartItemsOrThrow('user-id'),
    ).resolves.toEqual({ deletedCount: 3, message: 'Success.' });
  });

  it('throws when no active cart item is deleted', async () => {
    cartItemsRepository.userSoftDeleteCartItem.mockResolvedValue(0);
    cartItemsRepository.softDeleteAllCartItemsOfUser.mockResolvedValue(0);

    await expect(
      service.userSoftDeleteUserCartItemOrThrow('cart-item-id', 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.softDeleteAllUserCartItemsOrThrow('user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
