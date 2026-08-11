import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './services/orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderItemsRepository } from './repositories/order.items.repository';
import { ProductsService } from '../products/services/products.service';
import { UsersService } from '../users/services/users.service';
import { UserAddressesService } from '../users/services/user.addresses.service';
import { OrderStatus, PaymentStatus } from './entities/order.entity';
import { CartItemsService } from '../carts/services/cart.items.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: { createOrder: jest.Mock; findOrderById: jest.Mock };
  let orderItemsRepo: { createOrderItem: jest.Mock };
  let productsService: { reserveProductStock: jest.Mock };
  let usersService: { findActiveUserEntityByUserIdOrThrow: jest.Mock };
  let userAddressesService: {
    findActiveUserAddressEntityByIdOrThrow: jest.Mock;
  };
  let cartItemsService: {
    findAllUserActiveCartItemEntitiesByUserIdOrThrow: jest.Mock;
    markAllUserCartItemsAsOrderedOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    ordersRepo = { createOrder: jest.fn(), findOrderById: jest.fn() };
    orderItemsRepo = { createOrderItem: jest.fn() };
    productsService = { reserveProductStock: jest.fn() };
    usersService = { findActiveUserEntityByUserIdOrThrow: jest.fn() };
    userAddressesService = {
      findActiveUserAddressEntityByIdOrThrow: jest.fn(),
    };
    cartItemsService = {
      findAllUserActiveCartItemEntitiesByUserIdOrThrow: jest.fn(),
      markAllUserCartItemsAsOrderedOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepo },
        { provide: OrderItemsRepository, useValue: orderItemsRepo },
        { provide: ProductsService, useValue: productsService },
        { provide: UsersService, useValue: usersService },
        { provide: UserAddressesService, useValue: userAddressesService },
        { provide: CartItemsService, useValue: cartItemsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates an order item with a product snapshot', async () => {
    productsService.reserveProductStock.mockResolvedValue({
      id: 'product-id',
      name: 'Product name',
      price: '12500.50',
    });
    orderItemsRepo.createOrderItem.mockImplementation(
      (orderId: string, data: object) =>
        Promise.resolve({
          id: 'order-item-id',
          orderId,
          ...data,
        }),
    );

    const result = await service.createOrderItem('order-id', {
      productId: 'product-id',
      quantity: 2,
      note: 'Handle with care',
    });

    expect(productsService.reserveProductStock).toHaveBeenCalledWith(
      'product-id',
      2,
    );
    expect(orderItemsRepo.createOrderItem).toHaveBeenCalledWith('order-id', {
      productId: 'product-id',
      productName: 'Product name',
      quantity: 2,
      unitPrice: 12500.5,
      note: 'Handle with care',
    });
    expect(result.id).toBe('order-item-id');
  });

  it('does not create an item when stock reservation fails', async () => {
    productsService.reserveProductStock.mockRejectedValue(
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

  it('creates a buy-now order and returns its response', async () => {
    const address = { id: 'address-id', userId: 'user-id' };
    const product = {
      id: 'product-id',
      shopId: 'shop-id',
      name: 'Product name',
      price: '100.00',
    };
    const orderItem = {
      id: 'order-item-id',
      orderId: 'order-id',
      productId: product.id,
      productName: product.name,
      quantity: 2,
      unitPrice: 100,
      note: 'Gift wrap',
    };
    const order = {
      id: 'order-id',
      userId: 'user-id',
      shopId: product.shopId,
      shipAddressId: address.id,
      orderCode: 'order-code',
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      discount: '0.00',
      shippingFee: '0.00',
      orderItems: [orderItem],
      shipAddress: address,
    };

    usersService.findActiveUserEntityByUserIdOrThrow.mockResolvedValue({
      id: 'user-id',
    });
    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    productsService.reserveProductStock.mockResolvedValue(product);
    ordersRepo.createOrder.mockResolvedValue(order);
    orderItemsRepo.createOrderItem.mockResolvedValue(orderItem);
    ordersRepo.findOrderById.mockResolvedValue(order);

    const result = await service.buyNow('user-id', {
      productId: product.id,
      quantity: 2,
      shipAddressId: address.id,
      note: 'Gift wrap',
    });

    expect(
      userAddressesService.findActiveUserAddressEntityByIdOrThrow,
    ).toHaveBeenCalledWith('user-id', address.id);
    expect(ordersRepo.createOrder).toHaveBeenCalledWith(
      'user-id',
      product.shopId,
      address.id,
    );
    expect(orderItemsRepo.createOrderItem).toHaveBeenCalledWith(
      order.id,
      expect.objectContaining({
        productId: product.id,
        productName: product.name,
        quantity: 2,
        unitPrice: 100,
        note: 'Gift wrap',
      }),
    );
    expect(result.id).toBe(order.id);
    expect(result.sub_total).toBe(200);
    expect(result.order_items).toHaveLength(1);
  });

  it('creates one order per shop from the active cart', async () => {
    const address = { id: 'address-id', userId: 'user-id' };
    const cartItems = [
      { productId: 'product-a', quantity: 2 },
      { productId: 'product-b', quantity: 1 },
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
    const createdItems = new Map<string, object[]>();

    usersService.findActiveUserEntityByUserIdOrThrow.mockResolvedValue({
      id: 'user-id',
    });
    userAddressesService.findActiveUserAddressEntityByIdOrThrow.mockResolvedValue(
      address,
    );
    cartItemsService.findAllUserActiveCartItemEntitiesByUserIdOrThrow.mockResolvedValue(
      cartItems,
    );
    productsService.reserveProductStock.mockImplementation(
      (productId: keyof typeof products) =>
        Promise.resolve(products[productId]),
    );
    ordersRepo.createOrder.mockImplementation(
      (userId: string, shopId: string, shipAddressId: string) =>
        Promise.resolve({
          id: `order-${shopId}`,
          userId,
          shopId,
          shipAddressId,
        }),
    );
    orderItemsRepo.createOrderItem.mockImplementation(
      (orderId: string, data: object) => {
        const items = createdItems.get(orderId) ?? [];
        items.push(data);
        createdItems.set(orderId, items);
        return Promise.resolve({ id: `item-${orderId}`, orderId, ...data });
      },
    );
    ordersRepo.findOrderById.mockImplementation((orderId: string) => {
      const shopId = orderId.replace('order-', '');
      return Promise.resolve({
        id: orderId,
        userId: 'user-id',
        shopId,
        shipAddressId: address.id,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        discount: 0,
        shippingFee: 0,
        orderItems: createdItems.get(orderId) ?? [],
        shipAddress: address,
      });
    });
    cartItemsService.markAllUserCartItemsAsOrderedOrThrow.mockResolvedValue(2);

    const result = await service.checkoutCart('user-id', {
      shipAddressId: address.id,
      items: [
        { productId: 'product-b', quantity: 1 },
        { productId: 'product-a', quantity: 2, note: 'Fragile' },
      ],
    });

    expect(ordersRepo.createOrder).toHaveBeenCalledTimes(2);
    expect(ordersRepo.createOrder).toHaveBeenCalledWith(
      'user-id',
      'shop-a',
      address.id,
    );
    expect(ordersRepo.createOrder).toHaveBeenCalledWith(
      'user-id',
      'shop-b',
      address.id,
    );
    expect(
      cartItemsService.markAllUserCartItemsAsOrderedOrThrow,
    ).toHaveBeenCalledWith('user-id', 2);
    expect(result).toHaveLength(2);
  });
});
