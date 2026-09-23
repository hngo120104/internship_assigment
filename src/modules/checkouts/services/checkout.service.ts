import { BadRequestException, Injectable } from '@nestjs/common';
import { OrdersService } from '../../orders/services/orders.service';
import { RedlockService } from '../../redis/services/redlock.service';
import { CheckoutRequestDto } from '../dto/requests/checkout.request.dto';
import { CheckoutResponseDto } from '../dto/responses/checkout.response.dto';
import type { PlaceOrdersCommand } from '../interfaces/place-orders.interface';
import { Order } from '../../orders/entities/order.entity';
import { Transactional } from 'typeorm-transactional';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { RequestedOrderItem } from '../../orders/interfaces/requested-item.interface';
import { RequestedItemsByShop } from '../../orders/types/requested-item-by-shop.type';
import { BuyNowRequestDto } from '../dto/requests/buy-now.request.dto';
import { UserAddressesService } from '../../users/services/user-addresses.service';
import { ProductVariantsService } from '../../products/services/product-variants.service';
import { CartItemsService } from '../../carts/services/cart-items.service';
import { CheckoutItemRequestDto } from '../dto/requests/checkout-item.request.dto';
import { CartItem } from '../../carts/entities/cart-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { toResponseDto } from '../../../utils/response-dto.mapper';
import {
  CheckoutRepository,
  CreateCheckoutData,
} from '../repositories/checkout.repository';
import { Checkout } from '../entities/checkout.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CheckoutStatus } from '../enums/checkout-status.enum';
import {
  InventoryCachingService,
  RedisReservationResult,
} from '../../products/services/inventory-caching.service';

const CHECKOUT_LOCK_TTL_MS = 5_000;

@Injectable()
export class CheckoutsService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly ordersService: OrdersService,
    private readonly productVariantsService: ProductVariantsService,
    private readonly userAddressesService: UserAddressesService,
    private readonly cartItemsService: CartItemsService,
    private readonly redlockService: RedlockService,
    private readonly inventoryCachingService: InventoryCachingService,
  ) {}

  private async placeOrdersWithLock(
    variantIds: string[],
    buildCommand: () => Promise<PlaceOrdersCommand>,
  ): Promise<Checkout> {
    const keys = [...new Set(variantIds)]
      .sort()
      .map((id) => `lock:variant:${id}`);

    return this.redlockService.withLock(
      keys,
      CHECKOUT_LOCK_TTL_MS,
      async () => {
        const command = await buildCommand();
        return this.placeOrders(command);
      },
    );
  }

  @Transactional()
  private async placeOrdersWithRedisCaching(
    command: PlaceOrdersCommand,
  ): Promise<Checkout | RedisReservationResult> {
    const { userId, idempotencyKey, itemsByShop, cartItemIds } = command;
    const requestedOrderItems = Array.from(itemsByShop.values()).flat();
    const reservationRequests = requestedOrderItems.map(
      ({ variant, amount }) => ({
        variantId: variant.id,
        amount,
      }),
    );
    const { success, succeededItems, failedItems } =
      await this.inventoryCachingService.reserveInventory(
        idempotencyKey,
        reservationRequests,
      );
    if (success && succeededItems) {
      const createdCheckout = this.createCheckout({
        userId: command.userId,
        idempotencyKey: command.idempotencyKey,
        shippingAddressId: command.shippingAddress.id,
        shippingAddress: command.shippingAddress,
        paymentMethod: command.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        orders: [],
        status: CheckoutStatus.PROCESSING,
      });

      const createdOrders =
        this.ordersService.createOrdersForEachShop(itemsByShop);
      createdCheckout.orders = createdOrders;
      if (cartItemIds) {
        await this.cartItemsService.markUserCartItemsAsOrderedOrThrow(
          userId,
          cartItemIds,
        );
      }
      for (const order of createdOrders) {
        order.checkout = createdCheckout;
      }
      createdCheckout.status = CheckoutStatus.COMPLETED;
      createdCheckout.completedAt = new Date();
      const savedCheckout =
        await this.checkoutRepository.saveCheckout(createdCheckout);
      await this.inventoryCachingService.releaseReservations(
        idempotencyKey,
        succeededItems?.map(({ variantId, reservedAmount }) => ({
          variantId: variantId,
          amount: reservedAmount,
        })),
      );
      return savedCheckout;
    } else {
      return {
        success: false,
        failedItems: failedItems,
      };
    }
  }

  @Transactional()
  private async placeOrders(command: PlaceOrdersCommand): Promise<Checkout> {
    const { userId, itemsByShop, cartItemIds } = command;
    const requestedOrderItems = Array.from(itemsByShop.values()).flat();
    await this.productVariantsService.validateAndReserveVariantsAmountOrThrow(
      requestedOrderItems.map(({ variant, amount }) => ({
        variant,
        amount: amount,
      })),
    );
    const createdCheckout = this.createCheckout({
      userId: command.userId,
      idempotencyKey: command.idempotencyKey,
      shippingAddressId: command.shippingAddress.id,
      shippingAddress: command.shippingAddress,
      paymentMethod: command.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      orders: [],
      status: CheckoutStatus.PROCESSING,
    });

    const createdOrders =
      this.ordersService.createOrdersForEachShop(itemsByShop);
    createdCheckout.orders = createdOrders;
    if (cartItemIds) {
      await this.cartItemsService.markUserCartItemsAsOrderedOrThrow(
        userId,
        cartItemIds,
      );
    }
    for (const order of createdOrders) {
      order.checkout = createdCheckout;
    }
    createdCheckout.status = CheckoutStatus.COMPLETED;
    createdCheckout.completedAt = new Date();
    const savedCheckout =
      await this.checkoutRepository.saveCheckout(createdCheckout);
    return savedCheckout;
  }

  private async processCheckout(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<Checkout> {
    const checkoutItems = checkoutRequestDto.checkoutItems;
    if (!checkoutItems.length) {
      throw new BadRequestException('Checkout items cannot be empty.');
    }
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOrThrow(
        userId,
        checkoutRequestDto.shippingAddressId,
      );
    //TODO: may need to refetch fresh cart items inside lock
    const userActiveCartItems =
      await this.cartItemsService.findActiveCartItemsEntitiesByUserIdAndIdsOrThrow(
        userId,
        checkoutRequestDto.checkoutItems.map((item) => item.cartItemId),
        checkoutRequestDto.checkoutItems.length,
      );
    const variantIds = userActiveCartItems.map((item) => item.variantId);

    return this.placeOrdersWithLock(variantIds, async () => {
      const purchasableVariants =
        await this.productVariantsService.findPurchasableVariantsEntitiesByIdsOrThrow(
          variantIds,
          userActiveCartItems.length,
        );
      const requestedOrderItemsByShop = this.groupOrderItemsByShopId(
        checkoutItems,
        userActiveCartItems,
        purchasableVariants,
      );

      return {
        userId: userId,
        idempotencyKey: checkoutRequestDto.idempotencyKey,
        shippingAddress: shippingAddress,
        paymentMethod: checkoutRequestDto.paymentMethod,
        itemsByShop: requestedOrderItemsByShop,
        cartItemIds: userActiveCartItems.map((item) => item.id),
      };
    });
  }

  private async processBuynow(
    userId: string,
    buyNowRequestDto: BuyNowRequestDto,
  ): Promise<Checkout> {
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOrThrow(
        userId,
        buyNowRequestDto.shippingAddressId,
      );
    const savedCheckout = await this.placeOrdersWithLock(
      [buyNowRequestDto.variantId],
      async () => {
        const foundVariant =
          await this.productVariantsService.findPurchasableVariantEntityByIdOrThrow(
            buyNowRequestDto.variantId,
          );
        const requestedOrderItem: RequestedOrderItem = {
          variant: foundVariant,
          amount: buyNowRequestDto.quantity,
          note: buyNowRequestDto.note,
        };
        const requestedOrderByShop: RequestedItemsByShop = new Map<
          string,
          RequestedOrderItem[]
        >().set(foundVariant.product.shopId, [requestedOrderItem]);

        return {
          userId: userId,
          idempotencyKey: buyNowRequestDto.idempotencyKey,
          shippingAddress: shippingAddress,
          paymentMethod: buyNowRequestDto.paymentMethod,
          itemsByShop: requestedOrderByShop,
        };
      },
    );
    return savedCheckout;
  }

  async buyNow(
    userId: string,
    buyNowRequestDto: BuyNowRequestDto,
  ): Promise<CheckoutResponseDto> {
    const savedCheckout = await this.processBuynow(userId, buyNowRequestDto);
    const response = toResponseDto(CheckoutResponseDto, savedCheckout);
    response.grandTotal = this.calculateGrandTotal(savedCheckout);
    return response;
  }

  async checkoutCart(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    this.validateCheckoutRequestNotEmpty(checkoutRequestDto);

    const createdCheckout = await this.processCheckout(
      userId,
      checkoutRequestDto,
    );
    const response = toResponseDto(CheckoutResponseDto, createdCheckout);
    response.grandTotal = this.calculateGrandTotal(createdCheckout);
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
        amount: cartItem.quantity,
        note: request.note,
      };

      const orderItemsOfShop = ordersByShop.get(variant.product.shopId) ?? [];
      orderItemsOfShop.push(orderItem);
      ordersByShop.set(variant.product.shopId, orderItemsOfShop);
    }

    return ordersByShop;
  }

  private calculateGrandTotal(checkout: Checkout): number {
    const grandTotal: number = checkout.orders.reduce(
      (total: number, order: Order) => {
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
      },
      0,
    );
    return grandTotal;
  }

  private validateCheckoutRequestNotEmpty(
    checkoutRequestDto: CheckoutRequestDto,
  ): string[] {
    if (checkoutRequestDto.checkoutItems.length === 0) {
      throw new BadRequestException('Cart items must not be empty.');
    }
    return checkoutRequestDto.checkoutItems.map((item) => item.cartItemId);
  }

  private createCheckout(data: CreateCheckoutData) {
    return this.checkoutRepository.createCheckout(data);
  }

  private async saveCheckout(checkout: Checkout): Promise<Checkout> {
    return await this.checkoutRepository.saveCheckout(checkout);
  }
}
