import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderItemsRepository } from '../repositories/order-items.repository';
import { Transactional } from 'typeorm-transactional';
import { CheckoutItemRequestDto } from '../dto/request/checkout-item.request.dto';
import { ProductVariantsService } from '../../products/services/product-variants.service';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { BuyNowRequestDto } from '../dto/request/buy-now.request.dto';
import { ShopOrderResponseDto } from '../dto/response/shop-order.response.dto';
import { UserAddressesService } from '../../users/services/user-addresses.service';
import { CheckoutRequestDto } from '../dto/request/checkout.request.dto';
import { CartItemsService } from '../../carts/services/cart-items.service';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/response-dto.mapper';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';
import { CheckoutResponseDto } from '../dto/response/checkout.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserAddress } from '../../users/entities/user-address.entity';
import { CartItem } from '../../carts/entities/cart-item.entity';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { FindOrderRequestDto } from '../dto/request/find-order.request.dto';
import {
  OrderPatchAction,
  OrderUpdateRequestDto,
} from '../dto/request/order-update.request.dto';
import type { RequestedItemsByShop } from '../types/requested-item-by-shop.type';
import { RequestedOrderItem } from '../interfaces/requested-item.interface';
import type { PlaceOrdersCommand } from '../interfaces/place-orders.interface';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly orderItemsRepository: OrderItemsRepository,
    private readonly productVariantsService: ProductVariantsService,
    private readonly userAddressesService: UserAddressesService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  private async findOrderEntityByShopIdAndOrderIdOrThrow(
    shopId: string,
    orderId: string,
  ): Promise<Order> {
    const foundOrder = await this.ordersRepository.findOrderByShopIdAndOrderId(
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
    const foundOrder = await this.ordersRepository.findOrderByUserIdAndOrderId(
      userId,
      orderId,
    );
    if (!foundOrder) {
      throw new NotFoundException('User order not found.');
    }
    return toResponseDto(ShopOrderResponseDto, foundOrder, ['order-details']);
  }

  async findAllUserOrdersWithOptionalStatusesByUserId(
    userId: string,
    findOrderRequestDto: FindOrderRequestDto,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    const [foundUserOrders, count] =
      await this.ordersRepository.findAllUserOrdersWithOptionalStatusesByUserId(
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
      throw new UnauthorizedException('User account is not a seller.');
    }
    const [foundShopOrders, count] =
      await this.ordersRepository.findAllShopOrdersWithOptionStatusesByShopId(
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

  async findShopOrderByShopIdAndOrderIdOrThrow(
    orderId: string,
    shopId?: string,
  ): Promise<ShopOrderResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User account is not a seller.');
    }
    const foundOrder = await this.findOrderEntityByShopIdAndOrderIdOrThrow(
      shopId,
      orderId,
    );
    return toResponseDto(ShopOrderResponseDto, foundOrder, ['order-details']);
  }

  @Transactional()
  private async placeOrders(command: PlaceOrdersCommand) {
    const { userId, shippingAddress, paymentMethod, itemsByShop, cartItemIds } =
      command;
    const requestedOrderItems = Array.from(itemsByShop.values()).flat();
    await this.productVariantsService.validateAndReserveVariantsAmountOrThrow(
      requestedOrderItems.map(({ variant, quantity }) => ({
        variant,
        quantity,
      })),
    );
    const createdOrders = this.createOrdersForEachShop(
      userId,
      shippingAddress,
      paymentMethod,
      itemsByShop,
    );
    const savedOrders = await this.ordersRepository.saveOrders(createdOrders);

    if (cartItemIds) {
      await this.cartItemsService.markUserCartItemsAsOrderedOrThrow(
        userId,
        cartItemIds,
      );
    }

    return savedOrders;
  }

  private async processCheckout(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<Order[]> {
    const checkoutItems = checkoutRequestDto.checkoutItems;
    if (!checkoutItems.length) {
      throw new BadRequestException('Checkout items cannot be empty.');
    }
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOrThrow(
        userId,
        checkoutRequestDto.shippingAddressId,
      );
    const userActiveCartItems =
      await this.cartItemsService.findActiveCartItemsEntitiesByUserIdAndIdsOrThrow(
        userId,
        checkoutRequestDto.checkoutItems.map((item) => item.cartItemId),
        checkoutRequestDto.checkoutItems.length,
      );
    const purchasableVariants =
      await this.productVariantsService.findPurchasableVariantsEntitiesByIdsOrThrow(
        userActiveCartItems.map((item) => item.variantId),
        userActiveCartItems.length,
      );
    const requestedOrderItemsByShop = this.groupOrderItemsByShopId(
      checkoutItems,
      userActiveCartItems,
      purchasableVariants,
    );

    return await this.placeOrders({
      userId: userId,
      shippingAddress: shippingAddress,
      paymentMethod: checkoutRequestDto.paymentMethod,
      itemsByShop: requestedOrderItemsByShop,
      cartItemIds: userActiveCartItems.map((item) => item.id),
    });
  }

  private async processBuynow(
    userId: string,
    buyNowRequestDto: BuyNowRequestDto,
  ): Promise<Order> {
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOrThrow(
        userId,
        buyNowRequestDto.shippingAddressId,
      );
    const foundVariant =
      await this.productVariantsService.findPurchasableVariantEntityByIdOrThrow(
        buyNowRequestDto.variantId,
      );
    const requestedOrderItem: RequestedOrderItem = {
      variant: foundVariant,
      quantity: buyNowRequestDto.quantity,
      note: buyNowRequestDto.note,
    };
    const requestedOrderByShop: RequestedItemsByShop = new Map<
      string,
      RequestedOrderItem[]
    >().set(foundVariant.product.shopId, [requestedOrderItem]);

    const [placedOrder] = await this.placeOrders({
      userId: userId,
      shippingAddress: shippingAddress,
      paymentMethod: buyNowRequestDto.paymentMethod,
      itemsByShop: requestedOrderByShop,
    });
    return placedOrder;
  }

  async buyNow(
    userId: string,
    buyNowRequestDto: BuyNowRequestDto,
  ): Promise<ShopOrderResponseDto> {
    const savedOrder = await this.processBuynow(userId, buyNowRequestDto);
    return toResponseDto(ShopOrderResponseDto, savedOrder, ['order-details']);
  }

  async checkoutCart(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    this.validateCheckoutRequestNotEmpty(checkoutRequestDto);

    const createdOrders = await this.processCheckout(
      userId,
      checkoutRequestDto,
    );

    const response = this.toCustomerOrderResponse(createdOrders);
    response.grandTotal = this.calculateGrandTotal(createdOrders);
    return response;
  }

  private groupOrderItemsByShopId(
    checkoutItems: CheckoutItemRequestDto[],
    cartItems: CartItem[],
    variants: ProductVariant[],
  ): RequestedItemsByShop {
    const requestsByCartItemId = new Map(
      checkoutItems.map((item) => [item.cartItemId, item]),
    );
    const variantsById = new Map(
      variants.map((variant) => [variant.id, variant]),
    );
    const sortedCartItems = [...cartItems].sort((left, right) => {
      return left.variantId.localeCompare(right.variantId);
    });
    const ordersByShop: RequestedItemsByShop = new Map();
    for (const cartItem of sortedCartItems) {
      const variant = variantsById.get(cartItem.variantId);
      const request = requestsByCartItemId.get(cartItem.id);
      if (!variant || !request) {
        throw new BadRequestException('Checkout item does not match cart.');
      }
      const orderItem: RequestedOrderItem = {
        variant: variant,
        quantity: cartItem.quantity,
        note: request.note,
      };

      const orderItemsOfShop = ordersByShop.get(variant.product.shopId) ?? [];
      orderItemsOfShop.push(orderItem);
      ordersByShop.set(variant.product.shopId, orderItemsOfShop);
    }

    return ordersByShop;
  }

  async shopShipOrderByOrderIdOrThrow(
    orderId: string,
    shopId: string,
  ): Promise<ShopOrderResponseDto> {
    const result = await this.ordersRepository.shopSendOrderToShipByOrderId(
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
    orderId: string,
    shopId: string,
  ): Promise<ShopOrderResponseDto> {
    const result = await this.ordersRepository.shopConfirmOrderByOrderId(
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
      await this.ordersRepository.findOrderByUserIdAndOrderIdAndLockForCancel(
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
    const [cancelledOrder] = await this.ordersRepository.saveOrders([order]);
    return cancelledOrder;
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
    shopId: string,
  ): Promise<ShopOrderResponseDto> {
    const confirmResult = await this.ordersRepository.shopConfirmOrderByOrderId(
      shopId,
      orderId,
    );
    if (!confirmResult) {
      throw new NotFoundException('Order not found or was already confirmed.');
    }
    return await this.findShopOrderByShopIdAndOrderIdOrThrow(orderId, shopId);
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
    orderId: string,
    request: OrderUpdateRequestDto,
    userId: string,
    shopId?: string,
  ): Promise<ShopOrderResponseDto> {
    switch (request.patchAction) {
      case OrderPatchAction.CONFIRM:
        this.ensureShopId(shopId);
        return await this.shopConfirmOrderOrThrow(orderId, shopId);
      case OrderPatchAction.PROCESS:
        this.ensureShopId(shopId);
        return await this.shopProcessOrderByOrderIdOrThrow(orderId, shopId);
      case OrderPatchAction.SHIP:
        this.ensureShopId(shopId);
        return await this.shopShipOrderByOrderIdOrThrow(orderId, shopId);
      // case OrderPatchAction.DELIVER:
      //   break;
      // case OrderPatchAction.REFUND:
      //   break;
      case OrderPatchAction.CANCEL:
        return await this.userCancelOrderOrThrow(userId, orderId);
      default:
        throw new BadRequestException('Action not allowed.');
    }
  }

  private ensureShopId(shopId?: string): asserts shopId is string {
    if (!shopId) {
      throw new ForbiddenException('Action now allowed.');
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
  ): string[] {
    if (checkoutRequestDto.checkoutItems.length === 0) {
      throw new BadRequestException('Cart items must not be empty.');
    }
    return checkoutRequestDto.checkoutItems.map((item) => item.cartItemId);
  }

  private createOrdersForEachShop(
    userId: string,
    shippingAddress: UserAddress,
    paymentMethod: PaymentMethod,
    requestedItemsByShop: RequestedItemsByShop,
  ): Order[] {
    const createdOrders: Order[] = [];

    for (const [shopId, items] of requestedItemsByShop) {
      const order = this.ordersRepository.createOrder(
        userId,
        shopId,
        shippingAddress,
        paymentMethod,
      );
      createdOrders.push(order);
      this.createOrderItemsForOrder(order, items);
    }
    return createdOrders;
  }

  private createOrderItemsForOrder(
    order: Order,
    requestedItems: RequestedOrderItem[],
  ): Order {
    const createdOrderItems: OrderItem[] = [];
    for (const orderItem of requestedItems) {
      const createdOrderItem = this.createOrderItemSnapshot(
        order,
        orderItem.quantity,
        orderItem.variant,
        orderItem.note,
      );
      createdOrderItems.push(createdOrderItem);
    }
    order.orderItems = createdOrderItems;
    return order;
  }

  private createOrderItemSnapshot(
    order: Order,
    quantity: number,
    variant: ProductVariant,
    note?: string,
  ): OrderItem {
    return this.orderItemsRepository.createOrderItem(order, {
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
