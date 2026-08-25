import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { FindOrderRequestDto } from '../dto/request/find.order.request.dto';
import {
  OrderPatchAction,
  OrderUpdateRequestDto,
} from '../dto/request/order.update.request.dto';

interface ReservedOrderItem {
  variant: ProductVariant;
  quantity: number;
  note?: string;
}

export type ReservedItemsByShop = Map<string, ReservedOrderItem[]>;

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
    findOrderRequestDto: FindOrderRequestDto,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    const [foundUserOrders, count] =
      await this.ordersRepo.findAllUserOrdersWithOptionalStatusesByUserId(
        userId,
        findOrderRequestDto.page,
        findOrderRequestDto.size,
        findOrderRequestDto.orderStatus,
        findOrderRequestDto.paymentStatus,
      );
    const response = toListResponseDtos(ShopOrderResponseDto, foundUserOrders, [
      'order-details',
    ]);
    return new ListResponseDto(
      response,
      count,
      findOrderRequestDto.page,
      findOrderRequestDto.size,
    );
  }

  async findAllShopOrdersWithOptionStatusesByShopIdOrThrow(
    findOrderRequestDto: FindOrderRequestDto,
    shopId?: string,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const [foundShopOrders, count] =
      await this.ordersRepo.findAllShopOrdersWithOptionStatusesByShopId(
        shopId,
        findOrderRequestDto.page,
        findOrderRequestDto.size,
        findOrderRequestDto.orderStatus,
        findOrderRequestDto.paymentStatus,
      );
    const response = toListResponseDtos(ShopOrderResponseDto, foundShopOrders, [
      'order-details',
    ]);
    return new ListResponseDto(
      response,
      count,
      findOrderRequestDto.page,
      findOrderRequestDto.size,
    );
  }

  async findShopOrderByUserIdAndOrderIdOrThrow(
    orderId: string,
    shopId?: string,
  ): Promise<ShopOrderResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const foundOrder = await this.findOrderEntityByShopIdAndOrderIdOrThrow(
      shopId,
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
      await this.productVariantsService.validateAndReserveVariantsAmountOrThrow(
        [{ variant: foundVariant, quantity: buyNowRequestDto.quantity }],
      );
    const reservedItem: ReservedOrderItem = {
      variant: reservedVariant[0],
      quantity: buyNowRequestDto.quantity,
      note: buyNowRequestDto.note,
    };
    const order = await this.createOrderWithItemsForShop(
      userId,
      reservedVariant[0].product.shopId,
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
    const cartItems =
      await this.cartItemsService.findLockedActiveCartItemsEntitiesByUserIdAndVariantIdsAndValidate(
        userId,
        checkoutRequestDto.orderItems.map((item) => item.variantId),
        checkoutRequestDto.orderItems.length,
      );

    const variants =
      await this.productVariantsService.findPurchasableVariantsEntitiesByIdsOrThrow(
        cartItems.map((item) => item.variantId),
        cartItems.length,
      );

    const groupedOrderItemsByShop =
      await this.reserveAndGroupOrderItemsByShopId(
        checkoutRequestDto.orderItems,
        cartItems,
        variants,
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
      cartItems.map((item) => item.id),
    );

    const response = this.toCustomerOrderResponse(createdOrders);
    response.grandTotal = this.calculateGrandTotal(createdOrders);
    return response;
  }

  private async reserveAndGroupOrderItemsByShopId(
    orderItemRequests: OrderItemCreateRequestDto[],
    cartItems: CartItem[],
    variants: ProductVariant[],
  ) {
    const requestsByVariantId = new Map(
      orderItemRequests.map((request) => [request.variantId, request]),
    );
    const cartItemsByVariantId = new Map(
      cartItems.map((item) => [item.variantId, item]),
    );
    const sortedVariants = [...variants].sort((l, r) => {
      return l.id.localeCompare(r.id);
    });
    const ordersByShop: ReservedItemsByShop = new Map();
    for (const variant of sortedVariants) {
      const cartItem = cartItemsByVariantId.get(variant.id);
      const request = requestsByVariantId.get(variant.id);
      if (!cartItem || !request) {
        throw new BadRequestException('Check out item doesnot match cart.');
      }
      const orderItem: ReservedOrderItem = {
        variant: variant,
        quantity: cartItem.quantity,
        note: request.note,
      };

      const orderItemsOfShop = ordersByShop.get(variant.product.shopId) ?? [];
      orderItemsOfShop.push(orderItem);
      ordersByShop.set(variant.product.shopId, orderItemsOfShop);
    }

    await this.productVariantsService.validateAndReserveVariantsAmountOrThrow(
      cartItems,
    );

    return ordersByShop;
  }

  async shopShipOrderByOrderIdOrThrow(
    shopId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const result = await this.ordersRepo.shopSendOrderToShipByOrderId(
      shopId,
      orderId,
    );
    if (!result) {
      throw new NotFoundException('Order not found or already sent to ship.');
    }
    const sentOrder = await this.findOrderEntityByShopIdAndOrderIdOrThrow(
      shopId,
      orderId,
    );
    return toResponseDto(ShopOrderResponseDto, sentOrder, ['order-details']);
  }

  async shopProcessOrderByOrderIdOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const shopId =
      await this.userShopService.findShopIdByUserIdOrThrowByUserIdOrThrow(
        userId,
      );
    const result = await this.ordersRepo.shopConfirmOrderByOrderId(
      shopId,
      orderId,
    );
    if (!result) {
      throw new NotFoundException('Shop order not found');
    }
    const processedOrder = await this.findOrderEntityByShopIdAndOrderIdOrThrow(
      shopId,
      orderId,
    );
    return toResponseDto(ShopOrderResponseDto, processedOrder, [
      'order-details',
    ]);
  }

  @Transactional()
  async userCancelOrderOrThrow(
    userId: string,
    orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const foundOrder =
      await this.ordersRepo.findOrderByUserIdAndOrderIdAndLockForCancel(
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
    const sortedOrderItems = this.sortOrderItemsByVariantId(order.orderItems);
    for (const item of sortedOrderItems) {
      await this.productVariantsService.validateAndRestockVariantQuantity(
        item.variantId,
        item.quantity,
      );
    }
  }

  private sortOrderItemsByVariantId(items: OrderItem[]): OrderItem[] {
    return [...items].sort((left, right) => {
      return left.variantId.localeCompare(right.variantId);
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
    orderId: string,
    shopId?: string,
  ): Promise<ShopOrderResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const confirmResult = await this.ordersRepo.shopConfirmOrderByOrderId(
      shopId,
      orderId,
    );
    if (!confirmResult) {
      throw new NotFoundException('Order not found or was already confirmed.');
    }
    return await this.findShopOrderByUserIdAndOrderIdOrThrow(shopId, orderId);
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

  async updateOrderByOrderId(
    userId: string,
    orderId: string,
    request: OrderUpdateRequestDto,
  ) {
    switch (request.patchAction) {
      case OrderPatchAction.CONFIRM:
        return await this.shopConfirmOrderOrThrow(userId, orderId);
      case OrderPatchAction.PROCESS:
        return await this.shopProcessOrderByOrderIdOrThrow(userId, orderId);
      case OrderPatchAction.CANCEL:
        return await this.userCancelOrderOrThrow(userId, orderId);
      case OrderPatchAction.SHIP:
        break;
      case OrderPatchAction.DELIVER:
        break;
      case OrderPatchAction.REFUND:
        break;
      default:
        throw new BadRequestException('Action not allowed.');
    }
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
    if (checkoutRequestDto.orderItems.length === 0) {
      throw new BadRequestException('Cart items must not be empty.');
    }
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
    for (const orderItem of reservedItems) {
      const createdOrderItem = await this.createOrderItemSnapshot(
        order.id,
        orderItem.quantity,
        orderItem.variant,
        orderItem.note,
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
