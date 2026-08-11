import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products/services/products.service';
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
    findActiveCartItemByUserIdAndProductId: jest.Mock;
    createCartItem: jest.Mock;
    saveCartItem: jest.Mock;
    softDeleteCartItem: jest.Mock;
    softDeleteAllCartItemsOfUser: jest.Mock;
  };
  let productsService: { validateProductQuantity: jest.Mock };

  beforeEach(async () => {
    cartItemsRepo = {
      findActiveCartItemByUserIdAndProductId: jest.fn(),
      createCartItem: jest.fn(),
      saveCartItem: jest.fn(),
      softDeleteCartItem: jest.fn(),
      softDeleteAllCartItemsOfUser: jest.fn(),
    };
    productsService = { validateProductQuantity: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemsService,
        { provide: CartItemsRepository, useValue: cartItemsRepo },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get<CartItemsService>(CartItemsService);
  });

  it('creates a new item when the product is not in the active cart', async () => {
    const createdItem = {
      id: 'cart-item-id',
      userId: 'user-id',
      productId: 'product-id',
      quantity: 2,
      product: { price: 100 },
    };
    cartItemsRepo.findActiveCartItemByUserIdAndProductId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdItem);
    cartItemsRepo.createCartItem.mockResolvedValue(createdItem);
    productsService.validateProductQuantity.mockResolvedValue(undefined);

    const result = await service.createNewCartItemOrAddQuantity('user-id', {
      productId: 'product-id',
      quantity: 2,
    });

    expect(productsService.validateProductQuantity).toHaveBeenCalledWith(
      'product-id',
      2,
    );
    expect(cartItemsRepo.createCartItem).toHaveBeenCalledWith(
      'user-id',
      'product-id',
      2,
    );
    expect(result.quantity).toBe(2);
    expect(result.line_total).toBe(200);
  });

  it('adds quantity when the product is already in the active cart', async () => {
    const existingItem = {
      id: 'cart-item-id',
      userId: 'user-id',
      productId: 'product-id',
      quantity: 2,
      product: { price: 100 },
    };
    cartItemsRepo.findActiveCartItemByUserIdAndProductId.mockResolvedValue(
      existingItem,
    );
    cartItemsRepo.saveCartItem.mockImplementation((cartItem: object) =>
      Promise.resolve(cartItem),
    );
    productsService.validateProductQuantity.mockResolvedValue(undefined);

    const result = await service.createNewCartItemOrAddQuantity('user-id', {
      productId: 'product-id',
      quantity: 3,
    });

    expect(productsService.validateProductQuantity).toHaveBeenCalledWith(
      'product-id',
      5,
    );
    expect(cartItemsRepo.createCartItem).not.toHaveBeenCalled();
    expect(result.quantity).toBe(5);
    expect(result.line_total).toBe(500);
  });

  it('returns the number of deleted cart items', async () => {
    cartItemsRepo.softDeleteCartItem.mockResolvedValue(1);
    cartItemsRepo.softDeleteAllCartItemsOfUser.mockResolvedValue(3);

    await expect(
      service.deleteUserCartItemOrThrow('cart-item-id', 'user-id'),
    ).resolves.toBe(1);
    await expect(
      service.deleteAllUserCartItemsOrThrow('user-id'),
    ).resolves.toBe(3);
  });

  it('throws when no active cart item is deleted', async () => {
    cartItemsRepo.softDeleteCartItem.mockResolvedValue(0);
    cartItemsRepo.softDeleteAllCartItemsOfUser.mockResolvedValue(0);

    await expect(
      service.deleteUserCartItemOrThrow('cart-item-id', 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.deleteAllUserCartItemsOrThrow('user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
