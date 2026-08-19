import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartItemsService } from '../carts/services/cart.items.service';
import { ProductVariantsService } from '../products/services/product.variants.service';
import { UserAddressesService } from '../users/services/user.addresses.service';
import { UserShopService } from '../users/services/user.shop.service';
import { PaymentMethod } from './entities/order.entity';
import { OrderItemsRepository } from './repositories/order.items.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersService } from './services/orders.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('OrdersService order creation flows', () => {
  let service: OrdersService;
  let ordersRepo: {
    createOrder: jest.Mock;
    findOrderByShopIdAndOrderId: jest.Mock;
  };
  let orderItemsRepo: { createOrderItem: jest.Mock };
  let productsService: {
    findPurchasableVariantEntityByIdOrThrow: jest.Mock;
    validateAndReserveVariantAmountOrThrow: jest.Mock;
  };
  let userAddressesService: {
    findActiveUserAddressEntityByIdOrThrow: jest.Mock;
  };
  let cartItemsService: {
    findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate: jest.Mock;
    markUserCartItemsAsOrderedOrThrow: jest.Mock;
  };
  let userShopService: { findFieldWithOptionByUserIdOrThrow: jest.Mock };

  beforeEach(async () => {
    ordersRepo = {
      createOrder: jest.fn(),
      findOrderByShopIdAndOrderId: jest.fn(),
    };
    orderItemsRepo = { createOrderItem: jest.fn() };
    productsService = {
      findPurchasableVariantEntityByIdOrThrow: jest.fn(),
      validateAndReserveVariantAmountOrThrow: jest.fn(),
    };
    userAddressesService = {
      findActiveUserAddressEntityByIdOrThrow: jest.fn(),
    };
    cartItemsService = {
      findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate:
        jest.fn(),
      markUserCartItemsAsOrderedOrThrow: jest.fn(),
    };
    userShopService = { findFieldWithOptionByUserIdOrThrow: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepo },
        { provide: OrderItemsRepository, useValue: orderItemsRepo },
        { provide: ProductVariantsService, useValue: productsService },
        { provide: UserShopService, useValue: userShopService },
        { provide: UserAddressesService, useValue: userAddressesService },
        { provide: CartItemsService, useValue: cartItemsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('creates an order item using the current variant snapshot', async () => {
    const address = { id: 'address-id' };
    productsService.findPurchasableVariantEntityByIdOrThrow.mockResolvedValue({
      id: 'variant-id',
    });
    productsService.validateAndReserveVariantAmountOrThrow.mockResolvedValue({
      id: 'variant-id',
      size: 'M',
      color: 'Black',
      price: '12500.50',
      product: { id: 'product-id', shopId: 'shop-id', name: 'Product name' },
    });
    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    ordersRepo.createOrder.mockResolvedValue({ id: 'order-id' });
    orderItemsRepo.createOrderItem.mockResolvedValue({ id: 'order-item-id' });

    await service.buyNow('user-id', {
      variantId: 'variant-id',
      quantity: 2,
      shipAddressId: address.id,
      paymentMethod: PaymentMethod.COD,
      note: 'Handle with care',
    });

    expect(orderItemsRepo.createOrderItem).toHaveBeenCalledWith('order-id', {
      productId: 'product-id',
      variantId: 'variant-id',
      productName: 'Product name',
      variantSize: 'M',
      variantColor: 'Black',
      quantity: 2,
      unitPrice: 12500.5,
      note: 'Handle with care',
    });
  });

  it('does not create an item when stock reservation fails', async () => {
    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      { id: 'address-id' },
    );
    productsService.findPurchasableVariantEntityByIdOrThrow.mockResolvedValue({
      id: 'variant-id',
    });
    productsService.validateAndReserveVariantAmountOrThrow.mockRejectedValue(
      new Error('Insufficient stock'),
    );

    await expect(
      service.buyNow('user-id', {
        variantId: 'variant-id',
        quantity: 10,
        shipAddressId: 'address-id',
        paymentMethod: PaymentMethod.COD,
      }),
    ).rejects.toThrow('Insufficient stock');
    expect(orderItemsRepo.createOrderItem).not.toHaveBeenCalled();
  });

  it('buy-now creates a BANKING order and returns its item and subtotal', async () => {
    const address = { id: 'address-id' };
    const variant = {
      id: 'variant-id',
      price: '100.00',
      product: {
        id: 'product-id',
        shopId: 'shop-id',
        name: 'Product name',
      },
    };
    const order = {
      id: 'order-id',
      userId: 'user-id',
      shopId: variant.product.shopId,
      shipAddressId: address.id,
      paymentMethod: PaymentMethod.BANKING,
    };
    const orderItem = {
      id: 'order-item-id',
      orderId: order.id,
      productId: variant.product.id,
      variantId: variant.id,
      productName: variant.product.name,
      quantity: 2,
      unitPrice: 100,
      note: 'Gift wrap',
    };

    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    productsService.findPurchasableVariantEntityByIdOrThrow.mockResolvedValue(
      variant,
    );
    productsService.validateAndReserveVariantAmountOrThrow.mockResolvedValue(
      variant,
    );
    ordersRepo.createOrder.mockResolvedValue(order);
    orderItemsRepo.createOrderItem.mockResolvedValue(orderItem);

    const result = await service.buyNow('user-id', {
      variantId: variant.id,
      quantity: 2,
      shipAddressId: address.id,
      paymentMethod: PaymentMethod.BANKING,
      note: 'Gift wrap',
    });

    expect(ordersRepo.createOrder).toHaveBeenCalledWith(
      'user-id',
      variant.product.shopId,
      address.id,
      address,
      PaymentMethod.BANKING,
    );
    expect(result.orderItems).toEqual([
      expect.objectContaining({
        productId: variant.product.id,
        variantId: variant.id,
        quantity: 2,
      }),
    ]);
    expect(result.subTotal).toBe(200);
  });

  it('checkout creates one COD order per shop and returns the combined total', async () => {
    const address = { id: 'address-id' };
    const cartItems = [
      { id: 'cart-a', variantId: 'variant-a', quantity: 2 },
      { id: 'cart-b', variantId: 'variant-b', quantity: 1 },
    ];
    const products = {
      'variant-a': {
        id: 'variant-a',
        price: '10.00',
        product: { id: 'product-a', shopId: 'shop-a', name: 'Product A' },
      },
      'variant-b': {
        id: 'variant-b',
        price: '20.00',
        product: { id: 'product-b', shopId: 'shop-b', name: 'Product B' },
      },
    };

    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    cartItemsService.findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate.mockResolvedValue(
      cartItems,
    );
    productsService.findPurchasableVariantEntityByIdOrThrow.mockImplementation(
      (variantId: keyof typeof products) =>
        Promise.resolve(products[variantId]),
    );
    productsService.validateAndReserveVariantAmountOrThrow.mockImplementation(
      (variant: (typeof products)[keyof typeof products]) =>
        Promise.resolve(variant),
    );
    ordersRepo.createOrder.mockImplementation(
      (
        userId: string,
        shopId: string,
        shipAddressId: string,
        shippingAddress: object,
        paymentMethod: PaymentMethod,
      ) =>
        Promise.resolve({
          id: `order-${shopId}`,
          userId,
          shopId,
          shipAddressId,
          shipAddress: shippingAddress,
          paymentMethod,
        }),
    );
    orderItemsRepo.createOrderItem.mockImplementation(
      (orderId: string, data: object) =>
        Promise.resolve({ id: `item-${orderId}`, orderId, ...data }),
    );
    cartItemsService.markUserCartItemsAsOrderedOrThrow.mockResolvedValue(2);

    const result = await service.checkoutCart('user-id', {
      shipAddressId: address.id,
      paymentMethod: PaymentMethod.COD,
      orderItems: [
        { variantId: 'variant-b', quantity: 1 },
        { variantId: 'variant-a', quantity: 2, note: 'Fragile' },
      ],
    });

    expect(ordersRepo.createOrder).toHaveBeenCalledTimes(2);
    expect(ordersRepo.createOrder).toHaveBeenNthCalledWith(
      1,
      'user-id',
      'shop-a',
      address.id,
      address,
      PaymentMethod.COD,
    );
    expect(
      cartItemsService.markUserCartItemsAsOrderedOrThrow,
    ).toHaveBeenCalledWith('user-id', ['cart-a', 'cart-b']);
    expect(result.orders).toHaveLength(2);
    expect(result.orders[0].orderItems).toHaveLength(1);
    expect(result.grandTotal).toBe(40);
  });

  it('checkout rejects a quantity that no longer matches the cart', async () => {
    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      {
        id: 'address-id',
      },
    );
    cartItemsService.findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate.mockRejectedValue(
      new BadRequestException('Cart item quantity has changed.'),
    );

    await expect(
      service.checkoutCart('user-id', {
        shipAddressId: 'address-id',
        paymentMethod: PaymentMethod.COD,
        orderItems: [{ variantId: 'variant-a', quantity: 2 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(
      productsService.validateAndReserveVariantAmountOrThrow,
    ).not.toHaveBeenCalled();
    expect(ordersRepo.createOrder).not.toHaveBeenCalled();
  });

  it('returns seller order details only through the seller shop', async () => {
    userShopService.findFieldWithOptionByUserIdOrThrow.mockResolvedValue({
      id: 'shop-id',
    });
    ordersRepo.findOrderByShopIdAndOrderId.mockResolvedValue({
      id: 'order-id',
      shopId: 'shop-id',
      orderItems: [],
    });

    const result = await service.findShopOrderByUserIdAndOrderIdOrThrow(
      'seller-id',
      'order-id',
    );

    expect(
      userShopService.findFieldWithOptionByUserIdOrThrow,
    ).toHaveBeenCalledWith('seller-id', { id: true });
    expect(ordersRepo.findOrderByShopIdAndOrderId).toHaveBeenCalledWith(
      'shop-id',
      'order-id',
    );
    expect(result.id).toBe('order-id');
  });
});
