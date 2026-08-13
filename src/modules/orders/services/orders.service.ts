import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderItemsRepository } from '../repositories/order.items.repository';
import { Transactional } from 'typeorm-transactional';
import { OrderItemCreateRequestDto } from '../dto/request/order.item.create.request.dto';
import { ProductsService } from '../../products/services/products.service';
import { OrderItem } from '../entities/order.item.entity';
import { Product } from '../../products/entities/product.entity';
import { BuyNowRequestDto } from '../dto/request/buynow.request.dto';
import { ShopOrderResponseDto } from '../dto/response/shop.order.response.dto';
import { UserAddressesService } from '../../users/services/user.addresses.service';
import { CheckoutRequestDto } from '../dto/request/checkout.request.dto';
import { CartItemsService } from '../../carts/services/cart.items.service';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import { Order, PaymentMethod } from '../entities/order.entity';
import { CartItem } from '../../carts/entities/cart.item.entity';
import { CheckoutResponseDto } from '../dto/response/customer.order.response.dto';
import { plainToInstance } from 'class-transformer';
import { Address } from '../../users/entities/user.address.entity';
import { UserShopService } from '../../users/services/user.shop.service';
import { group } from 'console';

interface ReservedOrderItem {
  request: OrderItemCreateRequestDto;
  product: Product;
}

type ReservedItemsByShop = Map<string, ReservedOrderItem[]>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly orderItemsRepo: OrderItemsRepository,
    private readonly productsService: ProductsService,
    private readonly userShopService: UserShopService,
    private readonly userAddressesService: UserAddressesService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  async findAllUserOrdersByUserIdOrThrow(
    userId: string,
  ): Promise<ShopOrderResponseDto[]> {
    const foundOrders = await this.ordersRepo.findAllUserOrders(userId);
    if (!foundOrders || foundOrders.length === 0) {
      throw new NotFoundException('User orders not found.');
    }
    return toListResponseDtos(ShopOrderResponseDto, foundOrders, [
      'customer-order',
    ]);
  }

  async findUserOrderByUserIdOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const foundOrder = await this.ordersRepo.findOrderByUserIdAndOrderId(
      userId,
      orderId,
    );
    if (!foundOrder) {
      throw new NotFoundException('User order not found.');
    }
    return toResponseDto(ShopOrderResponseDto, foundOrder, ['order-details']);
  }

  async findUserOrderByShopIdOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const userShopId =
      await this.userShopService.findFieldWithOptionByUserIdOrThrow(userId, {
        id: true,
      });
    const foundOrder = await this.ordersRepo.findOrderByUserIdAndOrderId(
      userShopId.id as string,
      orderId,
    );
    if (!foundOrder) {
      throw new NotFoundException('Order not found.');
    }
    return toResponseDto(ShopOrderResponseDto, foundOrder, ['order-details']);
  }

  async findUserShopPendingOrderByUserIdOrThrow(
    userId: string,
  ): Promise<ShopOrderResponseDto[]> {
    const userShopId =
      await this.userShopService.findFieldWithOptionByUserIdOrThrow(userId, {
        id: true,
      });
    const foundShopPendingOrders =
      await this.ordersRepo.findUserShopPendingOrdersByShopId(
        userShopId.id as string,
      );
    console.log(foundShopPendingOrders);
    if (!foundShopPendingOrders || foundShopPendingOrders.length === 0) {
      throw new NotFoundException('Shop pending orders not found.');
    }
    return toListResponseDtos(ShopOrderResponseDto, foundShopPendingOrders, [
      'customer-order',
    ]);
  }

  @Transactional()
  async buyNow(
    userId: string,
    buyNowRequestDto: BuyNowRequestDto,
  ): Promise<ShopOrderResponseDto> {
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOrThrow(
        userId,
        buyNowRequestDto.shipAddressId,
      );
    const reservedProduct =
      await this.productsService.validateAndReserveProductStock(
        buyNowRequestDto.productId,
        buyNowRequestDto.quantity,
      );

    // create order with product snap shot and return order id
    const order = await this.createOrderWithItemsForShop(
      userId,
      reservedProduct.shopId,
      shippingAddress.id,
      shippingAddress,
      buyNowRequestDto.paymentMethod,
      [{ request: buyNowRequestDto, product: reservedProduct }],
    );

    return toResponseDto(ShopOrderResponseDto, order, ['order-details']);
  }

  @Transactional()
  async checkoutCart(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    this.validateCheckoutRequestNotEmpty(checkoutRequestDto);

    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOrThrow(
        userId,
        checkoutRequestDto.shipAddressId,
      );

    const foundActiveUserCartItems =
      await this.cartItemsService.findActiveCartItemsEntitiesByUserIdAndProductIdsOrThrow(
        userId,
        checkoutRequestDto.orderItems.map((item) => item.productId),
        checkoutRequestDto.orderItems.length,
      );

    // use dto here because cart items might hold the older datas
    const itemsToCheckout = this.sortItemsByProductIdForLocking(
      checkoutRequestDto.orderItems,
    );

    this.validateOrderItemRequestsMatchesUserCartItems(
      checkoutRequestDto.orderItems,
      foundActiveUserCartItems,
    );
    // obj: { shopId, { orderCreateDto, Product }}
    // reserve product amount for each order item and group order items by shop
    const reservedOrderItemsByShop =
      await this.reserveProductsAndGroupItemsByShop(itemsToCheckout);
    // create order item snapshots and assign them to order
    // then assign order to shop by shop id
    // cart status = PENDING, payment status = PENDING
    const createdOrders = await this.createOrdersForEachShop(
      userId,
      shippingAddress.id,
      shippingAddress,
      checkoutRequestDto.paymentMethod,
      reservedOrderItemsByShop,
    );

    await this.cartItemsService.markUserCartItemsAsOrderedOrThrow(
      userId,
      foundActiveUserCartItems.map((item) => item.id),
    );

    const response = this.toCustomerOrderResponse(createdOrders);
    response.grandTotal = this.calculateGrandTotal(createdOrders);
    return response;
  }

  async userCancelOrderOrThrow(
    userId: string,
    orderId: string,
  ): Promise<{ message: string }> {
    const cancelResult = await this.ordersRepo.userCancelOrderByOrderId(
      userId,
      orderId,
    );
    if (!cancelResult) {
      throw new NotFoundException('User order not found.');
    }
    return {
      message: 'Cancel order Success.',
    };
  }

  async shopConfirmOrderOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const userShopId =
      await this.userShopService.findFieldWithOptionByUserIdOrThrow(userId, {
        id: true,
      });
    const confirmResult = await this.ordersRepo.shopConfirmOrderByOrderId(
      userShopId.id as string,
      orderId,
    );
    if (!confirmResult) {
      throw new NotFoundException('Order not found.');
    }
    const confirmedOrder = await this.ordersRepo.findOrderById(orderId);
    return toResponseDto(ShopOrderResponseDto, confirmedOrder, [
      'order-details',
    ]);
  }

  private calculateGrandTotal(orders: Order[]): number {
    const grandTotal: number = orders.reduce((total: number, order: Order) => {
      const items: OrderItem[] = order.orderItems;
      const sum = items.reduce(
        (sum: number, item: OrderItem) =>
          sum + (item.quantity ?? 0) * Number(item.unitPrice ?? 0),
        0,
      );
      return sum + total;
    }, 0);
    return grandTotal;
  }

  private toCustomerOrderResponse(orders: Order[]): CheckoutResponseDto {
    return plainToInstance(
      CheckoutResponseDto,
      { orders: orders },
      {
        groups: ['customer-order'],
        excludeExtraneousValues: true,
      },
    );
  }

  private validateCheckoutRequestNotEmpty(
    checkoutRequestDto: CheckoutRequestDto,
  ) {
    if (
      !checkoutRequestDto.orderItems ||
      checkoutRequestDto.orderItems.length === 0
    ) {
      throw new BadRequestException('Cart items must not be empty.');
    }
  }

  private validateOrderItemRequestsMatchesUserCartItems(
    orderItemCreateDtos: OrderItemCreateRequestDto[],
    cartItems: CartItem[],
  ) {
    const orderItemsByProductId = new Map(
      orderItemCreateDtos.map((item) => [item.productId, item]),
    );
    for (const cartItem of cartItems) {
      if (
        cartItem.quantity !==
        orderItemsByProductId.get(cartItem.productId)?.quantity
      ) {
        throw new BadRequestException(
          `Quantity of product ${cartItem.productId} has been changed.`,
        );
      }
    }
  }

  private sortItemsByProductIdForLocking(
    orderItemCreateDtos: OrderItemCreateRequestDto[],
  ): OrderItemCreateRequestDto[] {
    return [...orderItemCreateDtos].sort((left, right) =>
      left.productId.localeCompare(right.productId),
    );
  }

  private async reserveProductsAndGroupItemsByShop(
    orderItemCreateDtos: OrderItemCreateRequestDto[],
  ): Promise<ReservedItemsByShop> {
    const reservedItemsByShop: ReservedItemsByShop = new Map();

    for (const item of orderItemCreateDtos) {
      const reservedProduct =
        await this.productsService.validateAndReserveProductStock(
          item.productId,
          item.quantity,
        );
      // group item by shop id
      const shopItems = reservedItemsByShop.get(reservedProduct.shopId) ?? [];
      shopItems.push({
        request: item,
        product: reservedProduct,
      });
      reservedItemsByShop.set(reservedProduct.shopId, shopItems);
    }
    return reservedItemsByShop;
  }

  private async createOrdersForEachShop(
    userId: string,
    shippingAddressId: string,
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
    reservedItemsByShop: ReservedItemsByShop,
  ): Promise<Order[]> {
    const createdOrders: Order[] = [];

    for (const [shopId, shopItems] of reservedItemsByShop) {
      const order = await this.createOrderWithItemsForShop(
        userId,
        shopId,
        shippingAddressId,
        shippingAddress,
        paymentMethod,
        shopItems,
      );
      createdOrders.push(order);
    }
    return createdOrders;
  }

  private async createOrderWithItemsForShop(
    userId: string,
    shopId: string,
    shippingAddressId: string,
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
    reservedItems: ReservedOrderItem[],
  ): Promise<Order> {
    const order = await this.ordersRepo.createOrder(
      userId,
      shopId,
      shippingAddressId,
      shippingAddress,
      paymentMethod,
    );
    const createdOrderItems: OrderItem[] = [];
    for (const { request, product } of reservedItems) {
      const createdOrderItem = await this.createOrderItemSnapshot(
        order.id,
        request,
        product,
      );
      createdOrderItems.push(createdOrderItem);
    }
    order.orderItems = createdOrderItems;
    return order;
  }

  private async createOrderItemSnapshot(
    orderId: string,
    orderItemCreateDto: OrderItemCreateRequestDto,
    product: Product,
  ): Promise<OrderItem> {
    return await this.orderItemsRepo.createOrderItem(orderId, {
      productId: product.id,
      productName: product.name,
      quantity: orderItemCreateDto.quantity,
      unitPrice: Number(product.price),
      note: orderItemCreateDto.note,
    });
  }
}
