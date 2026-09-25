import { CheckoutsService } from './checkout.service';
import { PaymentMethod } from '../enums/payment-method.enum';
import {
  RedisReservationReturn,
  type InventoryCachingService,
} from '../../products/services/inventory-caching.service';
import { InsufficientVariantAmountException } from '../../products/exceptions/variant-insufficient-stock.exception';
import type { PlaceOrdersCommand } from '../interfaces/place-orders.interface';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

jest.mock('../../orders/services/orders.service', () => ({
  OrdersService: class OrdersService {},
}));

jest.mock('../../products/services/product-variants.service', () => ({
  ProductVariantsService: class ProductVariantsService {},
}));

describe('CheckoutsService inventory integration', () => {
  const checkoutRepository = {
    createCheckout: jest.fn((data: object) => ({ ...data })),
    saveCheckout: jest.fn((checkout: object) => Promise.resolve(checkout)),
    findByUserIdAndIdempotencyKey: jest.fn(() => Promise.resolve(null)),
  };
  const ordersService = {
    createOrdersForEachShop: jest.fn(() => []),
  };
  const productVariantsService = {
    reserveVariantsAmountAtomicallyOrThrow: jest.fn(() => Promise.resolve(1)),
  };
  const cartItemsService = {
    markUserCartItemsAsOrderedOrThrow: jest.fn(() => Promise.resolve(1)),
  };
  const inventoryCachingService = {
    reserveInventory: jest.fn(),
    releaseReservations: jest.fn(() => Promise.resolve(undefined)),
    completeReservation: jest.fn(() => Promise.resolve(undefined)),
  };
  const redlockService = {
    withLock: jest.fn(
      (
        _resources: string[],
        _ttlMs: number,
        callback: () => Promise<unknown>,
      ) => callback(),
    ),
  };

  let service: CheckoutsService;
  let command: PlaceOrdersCommand;

  beforeEach(() => {
    jest.clearAllMocks();
    checkoutRepository.findByUserIdAndIdempotencyKey.mockResolvedValue(null);
    service = new CheckoutsService(
      checkoutRepository as never,
      ordersService as never,
      productVariantsService as never,
      {} as never,
      cartItemsService as never,
      redlockService as never,
      inventoryCachingService as unknown as InventoryCachingService,
    );

    const variant = {
      id: 'variant-id',
      amount: 5,
      product: { shopId: 'shop-id' },
    };
    command = {
      userId: 'user-id',
      idempotencyKey: 'idempotency-key',
      shippingAddress: { id: 'address-id' } as never,
      paymentMethod: PaymentMethod.COD,
      itemsByShop: new Map([
        [
          'shop-id',
          [
            { variant: variant as never, amount: 1 },
            { variant: variant as never, amount: 2 },
          ],
        ],
      ]),
    };
  });

  const placeOrdersWithInventory = () =>
    (
      service as unknown as {
        placeOrdersWithInventoryReservation(
          input: PlaceOrdersCommand,
        ): Promise<unknown>;
      }
    ).placeOrdersWithInventoryReservation(command);

  it('reserves Redis inventory, uses the existing placeOrders flow, then completes the reservation', async () => {
    inventoryCachingService.reserveInventory.mockResolvedValue({
      state: RedisReservationReturn.SUCCESS,
      succeededItems: [{ variantId: 'variant-id', reservedAmount: 3 }],
    });

    await placeOrdersWithInventory();

    expect(inventoryCachingService.reserveInventory).toHaveBeenCalledWith(
      'user-id:idempotency-key',
      [{ variantId: 'variant-id', amount: 3 }],
    );
    expect(
      productVariantsService.reserveVariantsAmountAtomicallyOrThrow,
    ).toHaveBeenCalledWith([{ variantId: 'variant-id', amount: 3 }]);
    expect(inventoryCachingService.completeReservation).toHaveBeenCalledWith(
      'user-id:idempotency-key',
    );
    expect(inventoryCachingService.releaseReservations).not.toHaveBeenCalled();
  });

  it('returns the existing insufficient-stock exception shape', async () => {
    inventoryCachingService.reserveInventory.mockResolvedValue({
      state: RedisReservationReturn.FAILED,
      failedItems: [
        { variantId: 'variant-id', requestAmount: 3, availableAmount: 2 },
      ],
    });

    await expect(placeOrdersWithInventory()).rejects.toBeInstanceOf(
      InsufficientVariantAmountException,
    );
    expect(
      productVariantsService.reserveVariantsAmountAtomicallyOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('compensates Redis inventory when the database order transaction fails', async () => {
    const databaseError = new Error('database failed');
    inventoryCachingService.reserveInventory.mockResolvedValue({
      state: RedisReservationReturn.SUCCESS,
    });
    productVariantsService.reserveVariantsAmountAtomicallyOrThrow.mockRejectedValueOnce(
      databaseError,
    );

    await expect(placeOrdersWithInventory()).rejects.toBe(databaseError);
    expect(inventoryCachingService.releaseReservations).toHaveBeenCalledWith(
      'user-id:idempotency-key',
      [{ variantId: 'variant-id', amount: 3 }],
    );
    expect(inventoryCachingService.completeReservation).not.toHaveBeenCalled();
  });

  it('returns the created checkout for a reused idempotency key', async () => {
    const existingCheckout = { id: 'checkout-id', orders: [] };
    checkoutRepository.findByUserIdAndIdempotencyKey.mockResolvedValue(
      existingCheckout,
    );
    inventoryCachingService.reserveInventory.mockResolvedValue({
      state: RedisReservationReturn.ALREADY_COMPLETED,
    });

    await expect(placeOrdersWithInventory()).resolves.toBe(existingCheckout);
    expect(
      checkoutRepository.findByUserIdAndIdempotencyKey,
    ).toHaveBeenCalledWith('user-id', 'idempotency-key');
    expect(
      productVariantsService.reserveVariantsAmountAtomicallyOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('locks concurrent checkout requests by user and idempotency key', async () => {
    inventoryCachingService.reserveInventory.mockResolvedValue({
      state: RedisReservationReturn.SUCCESS,
    });

    await (
      service as unknown as {
        placeOrdersWithIdempotencyLock(
          userId: string,
          idempotencyKey: string,
          buildCommand: () => Promise<PlaceOrdersCommand>,
        ): Promise<unknown>;
      }
    ).placeOrdersWithIdempotencyLock('user-id', 'idempotency-key', () =>
      Promise.resolve(command),
    );

    expect(redlockService.withLock).toHaveBeenCalledWith(
      ['lock:checkout:idempotency:user-id:idempotency-key'],
      5_000,
      expect.any(Function),
    );
  });

  it('returns an existing checkout before rebuilding a duplicate request', async () => {
    const existingCheckout = { id: 'checkout-id', orders: [] };
    const buildCommand = jest.fn(() => Promise.resolve(command));
    checkoutRepository.findByUserIdAndIdempotencyKey.mockResolvedValue(
      existingCheckout,
    );

    const result = await (
      service as unknown as {
        placeOrdersWithIdempotencyLock(
          userId: string,
          idempotencyKey: string,
          buildCommand: () => Promise<PlaceOrdersCommand>,
        ): Promise<unknown>;
      }
    ).placeOrdersWithIdempotencyLock(
      'user-id',
      'idempotency-key',
      buildCommand,
    );

    expect(result).toBe(existingCheckout);
    expect(buildCommand).not.toHaveBeenCalled();
    expect(inventoryCachingService.reserveInventory).not.toHaveBeenCalled();
  });
});
