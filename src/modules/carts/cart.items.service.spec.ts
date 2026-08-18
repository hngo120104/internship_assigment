import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantsService } from '../products/services/product.variants.service';
import { CartItemsRepository } from './repositories/cart.items.repository';
import { CartItemsService } from './services/cart.items.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('CartItemsService', () => {
  let service: CartItemsService;
  let cartItemsRepo: {
    findActiveCartItemByUserIdAndVariantId: jest.Mock;
    findActiveCartItemByUserIdAndVariantIdAndLockForUpdate: jest.Mock;
    createCartItem: jest.Mock;
    saveCartItem: jest.Mock;
    softDeleteCartItem: jest.Mock;
    softDeleteAllCartItemsOfUser: jest.Mock;
  };
  let productsService: { validateVariantQuantity: jest.Mock };

  beforeEach(async () => {
    cartItemsRepo = {
      findActiveCartItemByUserIdAndVariantId: jest.fn(),
      findActiveCartItemByUserIdAndVariantIdAndLockForUpdate: jest.fn(),
      createCartItem: jest.fn(),
      saveCartItem: jest.fn(),
      softDeleteCartItem: jest.fn(),
      softDeleteAllCartItemsOfUser: jest.fn(),
    };
    productsService = { validateVariantQuantity: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemsService,
        { provide: CartItemsRepository, useValue: cartItemsRepo },
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
    cartItemsRepo.findActiveCartItemByUserIdAndVariantIdAndLockForUpdate.mockResolvedValue(
      null,
    );
    cartItemsRepo.findActiveCartItemByUserIdAndVariantId.mockResolvedValue(
      createdItem,
    );
    cartItemsRepo.createCartItem.mockResolvedValue(createdItem);
    productsService.validateVariantQuantity.mockResolvedValue(undefined);

    const result = await service.addCartItem('user-id', {
      variantId: 'variant-id',
      quantity: 2,
    });

    expect(productsService.validateVariantQuantity).toHaveBeenCalledWith(
      'variant-id',
      2,
    );
    expect(cartItemsRepo.createCartItem).toHaveBeenCalledWith(
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
    cartItemsRepo.findActiveCartItemByUserIdAndVariantIdAndLockForUpdate.mockResolvedValue(
      existingItem,
    );
    cartItemsRepo.saveCartItem.mockImplementation((cartItem: object) =>
      Promise.resolve(cartItem),
    );
    productsService.validateVariantQuantity.mockResolvedValue(undefined);

    const result = await service.addCartItem('user-id', {
      variantId: 'variant-id',
      quantity: 3,
    });

    expect(productsService.validateVariantQuantity).toHaveBeenCalledWith(
      'variant-id',
      5,
    );
    expect(cartItemsRepo.createCartItem).not.toHaveBeenCalled();
    expect(result.quantity).toBe(5);
    expect(result.lineTotal).toBe(500);
  });

  it('returns the deleted cart items response', async () => {
    cartItemsRepo.softDeleteCartItem.mockResolvedValue(1);
    cartItemsRepo.softDeleteAllCartItemsOfUser.mockResolvedValue(3);

    await expect(
      service.softDeleteUserCartItemOrThrow('cart-item-id', 'user-id'),
    ).resolves.toEqual({ deletedCount: 1, message: 'Success.' });
    await expect(
      service.softDeleteAllUserCartItemsOrThrow('user-id'),
    ).resolves.toEqual({ deletedCount: 3, message: 'Success.' });
  });

  it('throws when no active cart item is deleted', async () => {
    cartItemsRepo.softDeleteCartItem.mockResolvedValue(0);
    cartItemsRepo.softDeleteAllCartItemsOfUser.mockResolvedValue(0);

    await expect(
      service.softDeleteUserCartItemOrThrow('cart-item-id', 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.softDeleteAllUserCartItemsOrThrow('user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
