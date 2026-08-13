import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartItemsService } from '../carts/services/cart.items.service';
import { ProductsService } from '../products/services/products.service';
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
  let productsService: { validateAndReserveProductStock: jest.Mock };
  let userAddressesService: {
    findActiveUserAddressEntityByIdOrThrow: jest.Mock;
  };
  let cartItemsService: {
    findActiveCartItemsEntitiesByUserIdAndProductIdsOrThrow: jest.Mock;
    markUserCartItemsAsOrderedOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    ordersRepo = { createOrder: jest.fn(), findOrderById: jest.fn() };
    orderItemsRepo = { createOrderItem: jest.fn() };
    productsService = { validateAndReserveProductStock: jest.fn() };
    userAddressesService = {
      findActiveUserAddressEntityByIdOrThrow: jest.fn(),
    };
    cartItemsService = {
      findActiveCartItemsEntitiesByUserIdAndProductIdsOrThrow: jest.fn(),
      markUserCartItemsAsOrderedOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepo },
        { provide: OrderItemsRepository, useValue: orderItemsRepo },
        { provide: ProductsService, useValue: productsService },
        { provide: UsersService, useValue: {} },
        { provide: UserShopService, useValue: {} },
        { provide: UserAddressesService, useValue: userAddressesService },
        { provide: CartItemsService, useValue: cartItemsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('creates an order item using the current product snapshot', async () => {
    productsService.validateAndReserveProductStock.mockResolvedValue({
      id: 'product-id',
      name: 'Product name',
      price: '12500.50',
    });
    orderItemsRepo.createOrderItem.mockResolvedValue({ id: 'order-item-id' });

    await service.createOrderItem('order-id', {
      productId: 'product-id',
      quantity: 2,
      note: 'Handle with care',
    });

    expect(orderItemsRepo.createOrderItem).toHaveBeenCalledWith('order-id', {
      productId: 'product-id',
      productName: 'Product name',
      quantity: 2,
      unitPrice: 12500.5,
      note: 'Handle with care',
    });
  });

  it('does not create an item when stock reservation fails', async () => {
    productsService.validateAndReserveProductStock.mockRejectedValue(
      new Error('Insufficient stock'),
    );

    await expect(
      service.createOrderItem('order-id', {
        productId: 'product-id',
        quantity: 10,
      }),
    ).rejects.toThrow('Insufficient stock');
    expect(orderItemsRepo.createOrderItem).not.toHaveBeenCalled();
  });

  it('buy-now creates a BANKING order and returns its item and subtotal', async () => {
    const address = { id: 'address-id' };
    const product = {
      id: 'product-id',
      shopId: 'shop-id',
      name: 'Product name',
      price: '100.00',
    };
    const order = {
      id: 'order-id',
      userId: 'user-id',
      shopId: product.shopId,
      shipAddressId: address.id,
      paymentMethod: PaymentMethod.BANKING,
    };
    const orderItem = {
      id: 'order-item-id',
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      quantity: 2,
      unitPrice: 100,
      note: 'Gift wrap',
    };

    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    productsService.validateAndReserveProductStock.mockResolvedValue(product);
    ordersRepo.createOrder.mockResolvedValue(order);
    orderItemsRepo.createOrderItem.mockResolvedValue(orderItem);

    const result = await service.buyNow('user-id', {
      productId: product.id,
      quantity: 2,
      shipAddressId: address.id,
      paymentMethod: PaymentMethod.BANKING,
      note: 'Gift wrap',
    });

    expect(ordersRepo.createOrder).toHaveBeenCalledWith(
      'user-id',
      product.shopId,
      address.id,
      address,
      PaymentMethod.BANKING,
    );
    expect(result.orderItems).toEqual([
      expect.objectContaining({ productId: product.id, quantity: 2 }),
    ]);
    expect(result.subTotal).toBe(200);
  });

  it('checkout creates one COD order per shop and returns the combined total', async () => {
    const address = { id: 'address-id' };
    const cartItems = [
      { id: 'cart-a', productId: 'product-a', quantity: 2 },
      { id: 'cart-b', productId: 'product-b', quantity: 1 },
    ];
    const products = {
      'product-a': {
        id: 'product-a',
        shopId: 'shop-a',
        name: 'Product A',
        price: '10.00',
      },
      'product-b': {
        id: 'product-b',
        shopId: 'shop-b',
        name: 'Product B',
        price: '20.00',
      },
    };

    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    cartItemsService.findActiveCartItemsEntitiesByUserIdAndProductIdsOrThrow.mockResolvedValue(
      cartItems,
    );
    productsService.validateAndReserveProductStock.mockImplementation(
      (productId: keyof typeof products) =>
        Promise.resolve(products[productId]),
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
        { productId: 'product-b', quantity: 1 },
        { productId: 'product-a', quantity: 2, note: 'Fragile' },
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
    cartItemsService.findActiveCartItemsEntitiesByUserIdAndProductIdsOrThrow.mockResolvedValue(
      [{ id: 'cart-a', productId: 'product-a', quantity: 3 }],
    );

    await expect(
      service.checkoutCart('user-id', {
        shipAddressId: 'address-id',
        paymentMethod: PaymentMethod.COD,
        orderItems: [{ productId: 'product-a', quantity: 2 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(
      productsService.validateAndReserveProductStock,
    ).not.toHaveBeenCalled();
    expect(ordersRepo.createOrder).not.toHaveBeenCalled();
  });
});
