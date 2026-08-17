import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartItemsService } from '../carts/services/cart.items.service';
import { ProductVariantsService } from '../products/services/product.variants.service';
import { UserAddressesService } from '../users/services/user.addresses.service';
import { UserShopService } from '../users/services/user.shop.service';
import { UsersService } from '../users/services/users.service';
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
  let ordersRepo: { createOrder: jest.Mock; findOrderById: jest.Mock };
  let orderItemsRepo: { createOrderItem: jest.Mock };
  let productsService: { validateAndReserveVariantStockOrThrow: jest.Mock };
  let userAddressesService: {
    findActiveUserAddressEntityByIdOrThrow: jest.Mock;
  };
  let cartItemsService: {
    findActiveCartItemsEntitiesByUserIdAndVariantIdsOrThrow: jest.Mock;
    markUserCartItemsAsOrderedOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    ordersRepo = { createOrder: jest.fn(), findOrderById: jest.fn() };
    orderItemsRepo = { createOrderItem: jest.fn() };
    productsService = { validateAndReserveVariantStockOrThrow: jest.fn() };
    userAddressesService = {
      findActiveUserAddressEntityByIdOrThrow: jest.fn(),
    };
    cartItemsService = {
      findActiveCartItemsEntitiesByUserIdAndVariantIdsOrThrow: jest.fn(),
      markUserCartItemsAsOrderedOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepo },
        { provide: OrderItemsRepository, useValue: orderItemsRepo },
        { provide: ProductVariantsService, useValue: productsService },
        { provide: UsersService, useValue: {} },
        { provide: UserShopService, useValue: {} },
        { provide: UserAddressesService, useValue: userAddressesService },
        { provide: CartItemsService, useValue: cartItemsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('creates an order item using the current variant snapshot', async () => {
    const address = { id: 'address-id' };
    productsService.validateAndReserveVariantStockOrThrow.mockResolvedValue({
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
    productsService.validateAndReserveVariantStockOrThrow.mockRejectedValue(
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
    productsService.validateAndReserveVariantStockOrThrow.mockResolvedValue(
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
    cartItemsService.findActiveCartItemsEntitiesByUserIdAndVariantIdsOrThrow.mockResolvedValue(
      cartItems,
    );
    productsService.validateAndReserveVariantStockOrThrow.mockImplementation(
      (variantId: keyof typeof products) =>
        Promise.resolve(products[variantId]),
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
    cartItemsService.findActiveCartItemsEntitiesByUserIdAndVariantIdsOrThrow.mockResolvedValue(
      [{ id: 'cart-a', variantId: 'variant-a', quantity: 3 }],
    );

    await expect(
      service.checkoutCart('user-id', {
        shipAddressId: 'address-id',
        paymentMethod: PaymentMethod.COD,
        orderItems: [{ variantId: 'variant-a', quantity: 2 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(
      productsService.validateAndReserveVariantStockOrThrow,
    ).not.toHaveBeenCalled();
    expect(ordersRepo.createOrder).not.toHaveBeenCalled();
  });
});
