import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderItemsRepository } from '../repositories/order.items.repository';
import { Transactional } from 'typeorm-transactional';
import { OrderItemCreateRequestDto } from '../dto/request/order.item.create.request.dto';
import { ProductVariantsService } from '../../products/services/product.variants.service';
import { OrderItem } from '../entities/order.item.entity';
import { ProductVariant } from '../../products/entities/product.variant.entity';
import { BuyNowRequestDto } from '../dto/request/buynow.request.dto';
import { ShopOrderResponseDto } from '../dto/response/shop.order.response.dto';
import { UserAddressesService } from '../../users/services/user.addresses.service';
import { CheckoutRequestDto } from '../dto/request/checkout.request.dto';
import { CartItemsService } from '../../carts/services/cart.items.service';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';
import { CheckoutResponseDto } from '../dto/response/customer.order.response.dto';
import { plainToInstance } from 'class-transformer';
import { Address } from '../../users/entities/user.address.entity';
import { UserShopService } from '../../users/services/user.shop.service';
import { CartItem } from '../../carts/entities/cart.item.entity';

interface ReservedOrderItem {
  quantity: number;
  variant: ProductVariant;
  note?: string;
}

type ReservedItemsByShop = Map<string, ReservedOrderItem[]>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly orderItemsRepo: OrderItemsRepository,
    private readonly productVariantsService: ProductVariantsService,
    private readonly userShopService: UserShopService,
    private readonly userAddressesService: UserAddressesService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  private async findOrderEntityByShopIdAndOrderIdOrThrow(
    shopId: string,
    orderId: string,
  ): Promise<Order> {
    const foundOrder = await this.ordersRepo.findOrderByShopIdAndOrderId(
      shopId,
      orderId,
    );
    if (!foundOrder) {
      throw new NotFoundException('Order not found.');
    }
    return foundOrder;
  }

  async findUserOrderByUserIdAndOrderIdOrThrow(
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

  async findAllUserOrdersWithOptionalStatusesByUserIdOrThrow(
    userId: string,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<ShopOrderResponseDto[]> {
    const foundUserOrders =
      await this.ordersRepo.findAllUserOrdersWithOptionalStatusesByUserId(
        userId,
        orderStatus,
        paymentStatus,
      );
    if (!foundUserOrders || foundUserOrders.length === 0) {
      throw new NotFoundException('User orders not found.');
    }
    return toListResponseDtos(ShopOrderResponseDto, foundUserOrders, [
      'order-details',
    ]);
  }

  async findAllShopOrdersWithOptionStatusesByShopIdOrThrow(
    userId: string,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<ShopOrderResponseDto[]> {
    const userShop =
      await this.userShopService.findFieldWithOptionByUserIdOrThrow(userId, {
        id: true,
      });
    const foundShopOrders =
      await this.ordersRepo.findAllShopOrdersWithOptionStatusesByShopId(
        userShop.id as string,
        orderStatus,
        paymentStatus,
      );
    if (!foundShopOrders || foundShopOrders.length === 0) {
      throw new NotFoundException('Shop orders not found.');
    }
    return toListResponseDtos(ShopOrderResponseDto, foundShopOrders, [
      'order-details',
    ]);
  }

  async findShopOrderByUserIdAndOrderIdOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const userShop =
      await this.userShopService.findFieldWithOptionByUserIdOrThrow(userId, {
        id: true,
      });
    const foundOrder = await this.findOrderEntityByShopIdAndOrderIdOrThrow(
      userShop.id as string,
      orderId,
    );
    return toResponseDto(ShopOrderResponseDto, foundOrder, ['order-details']);
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
    const foundVariant =
      await this.productVariantsService.findPurchasableVariantEntityByIdOrThrow(
        buyNowRequestDto.variantId,
      );
    const reservedVariant =
      await this.productVariantsService.validateAndReserveVariantStockOrThrow(
        foundVariant,
        buyNowRequestDto.quantity,
      );
    const reservedItem: ReservedOrderItem = {
      quantity: buyNowRequestDto.quantity,
      variant: reservedVariant,
      note: buyNowRequestDto.note,
    };
    const order = await this.createOrderWithItemsForShop(
      userId,
      reservedVariant.product.shopId,
      shippingAddress.id,
      shippingAddress,
      buyNowRequestDto.paymentMethod,
      [reservedItem],
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
      await this.cartItemsService.findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate(
        userId,
        checkoutRequestDto.orderItems.map((item) => item.variantId),
        checkoutRequestDto.orderItems.length,
      );

    const groupedOrderItemsByShop =
      await this.reserveAmountAndGroupOrderItemsByShopId(
        foundActiveUserCartItems,
        checkoutRequestDto.orderItems
      );

    const createdOrders = await this.createOrdersForEachShop(
      userId,
      shippingAddress.id,
      shippingAddress,
      checkoutRequestDto.paymentMethod,
      groupedOrderItemsByShop,
    );

    await this.cartItemsService.markUserCartItemsAsOrderedOrThrow(
      userId,
      foundActiveUserCartItems.map((item) => item.id),
    );

    const response = this.toCustomerOrderResponse(createdOrders);
    response.grandTotal = this.calculateGrandTotal(createdOrders);
    return response;
  }

  private async reserveAmountAndGroupOrderItemsByShopId(
    cartItems: CartItem[],
  ): Promise<ReservedItemsByShop> {
    const reservedOrders: ReservedItemsByShop = new Map();
    for (const item of cartItems) {
      const foundVariant =
        await this.productVariantsService.findPurchasableVariantEntityByIdOrThrow(
          item.variantId,
        );
      await this.productVariantsService.validateAndReserveVariantStockOrThrow(
        foundVariant,
        item.quantity,
      );
      const shopOrderItems: ReservedOrderItem[] =
        reservedOrders.get(foundVariant.product.shopId) ?? [];
      shopOrderItems.push({
        quantity: item.quantity,
        variant: foundVariant,
      });
      reservedOrders.set(foundVariant.product.shopId, shopOrderItems);
    }
    return reservedOrders;
  }

  @Transactional()
  async userCancelOrderOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const foundOrder = await this.ordersRepo.findOrderByUserIdAndOrderIdAndLock(
      userId,
      orderId,
    );
    if (!foundOrder) {
      throw new NotFoundException('Order not found.');
    }
    await this.proccessRestockOrderProducts(foundOrder);
    const cancelledOrder =
      await this.setOrderCancelledAndRefundedOrThrow(foundOrder);
    return toResponseDto(ShopOrderResponseDto, cancelledOrder, [
      'order-details',
    ]);
  }

  private async proccessRestockOrderProducts(order: Order) {
    const sortedOrderItems = this.sortOrderItems(order.orderItems);
    for (const item of sortedOrderItems) {
      await this.productVariantsService.validateAndRestockVariantQuantity(
        item.variantId,
        item.productId,
        item.quantity,
      );
    }
  }

  private sortOrderItems(items: OrderItem[]): OrderItem[] {
    return [...items].sort((left, right) => {
      return left.id.localeCompare(right.id);
    });
  }

  private async setOrderCancelledAndRefundedOrThrow(
    order: Order,
  ): Promise<Order> {
    this.validateOrderStatusToCancel(order);
    order.orderStatus = OrderStatus.CANCELLED;
    if (
      order.paymentStatus === PaymentStatus.PAID &&
      order.paymentMethod === PaymentMethod.BANKING
    )
      order.paymentStatus = PaymentStatus.REFUNDED;
    return await this.ordersRepo.saveOrder(order);
  }

  private validateOrderStatusToCancel(order: Order) {
    if (
      ![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(
        order.orderStatus,
      ) ||
      ![PaymentStatus.PENDING, PaymentStatus.PAID].includes(order.paymentStatus)
    ) {
      throw new BadRequestException('Order cannot be cancelled.');
    }
  }

  @Transactional()
  async shopConfirmOrderOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const userShop =
      await this.userShopService.findFieldWithOptionByUserIdOrThrow(userId, {
        id: true,
      });
    const foundLockedOrder =
      await this.ordersRepo.findOrderByShopIdAndOrderIdAndLock(
        userShop.id as string,
        orderId,
      );
    if (!foundLockedOrder) {
      throw new NotFoundException('Order not found.');
    }
    const confirmedOrder =
      await this.validateAndSetOrderConfirmedOrThrow(foundLockedOrder);
    return toResponseDto(ShopOrderResponseDto, confirmedOrder, [
      'order-details',
    ]);
  }

  private async validateAndSetOrderConfirmedOrThrow(
    order: Order,
  ): Promise<Order> {
    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot confirm this order.');
    }
    order.orderStatus = OrderStatus.CONFIRMED;
    return await this.ordersRepo.saveOrder(order);
  }

  private calculateGrandTotal(orders: Order[]): number {
    const grandTotal: number = orders.reduce((total: number, order: Order) => {
      const items: OrderItem[] = order.orderItems;
      const sum = items.reduce(
        (sum: number, item: OrderItem) =>
          sum + (item.quantity ?? 0) * Number(item.unitPrice ?? 0),
        0,
      );
      return (
        total +
        sum -
        Number(order.discount ?? 0) +
        Number(order.shippingFee ?? 0)
      );
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

  private sortOrderItemsByVariantIdForLocking(
    orderItemCreateDtos: OrderItemCreateRequestDto[],
  ): OrderItemCreateRequestDto[] {
    return [...orderItemCreateDtos].sort((left, right) =>
      left.variantId.localeCompare(right.variantId),
    );
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
    for (const { quantity, variant, note } of reservedItems) {
      const createdOrderItem = await this.createOrderItemSnapshot(
        order.id,
        quantity,
        variant,
        note,
      );
      createdOrderItems.push(createdOrderItem);
    }
    order.orderItems = createdOrderItems;
    return order;
  }

  private async createOrderItemSnapshot(
    orderId: string,
    quantity: number,
    variant: ProductVariant,
    note?: string,
  ): Promise<OrderItem> {
    return await this.orderItemsRepo.createOrderItem(orderId, {
      productId: variant.product.id,
      variantId: variant.id,
      productName: variant.product.name,
      variantSize: variant.size,
      variantColor: variant.color,
      quantity: quantity,
      unitPrice: Number(variant.price),
      note: note,
    });
  }
}
