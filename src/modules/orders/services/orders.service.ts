import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderItemsRepository } from '../repositories/order.items.repository';
import { Transactional } from 'typeorm-transactional';
import { OrderItemCreateDto } from '../dto/order.item.create.dto';
import { ProductsService } from '../../products/services/products.service';
import { OrderItem } from '../entities/order.item.entity';
import { Order } from '../entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { BuyNowRequestDto } from '../dto/buynow.request.dto';
import { OrderResponseDto } from '../dto/order.response.dto';
import { UsersService } from '../../users/services/users.service';
import { UserAddressesService } from '../../users/services/user.addresses.service';
import { CheckoutRequestDto } from '../dto/checkout.request.dto';
import { CartItem } from '../../carts/entities/cart.item.entity';
import { CartItemsService } from '../../carts/services/cart.items.service';
import { toResponseDto } from '../../../utils/to.dto.response';

interface ReservedOrderItem {
  request: OrderItemCreateDto;
  product: Product;
}

type ReservedItemsByShop = Map<string, ReservedOrderItem[]>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly orderItemsRepo: OrderItemsRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly userAddressesService: UserAddressesService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  async findUserPendingOrderByUserId(
    userId: string,
  ): Promise<OrderResponseDto> {
    const foundPendingOrder =
      await this.ordersRepo.findPendingOrderByUserId(userId);
    if (!foundPendingOrder) {
      throw new NotFoundException('User does not have pending order.');
    }
    return toResponseDto(OrderResponseDto, foundPendingOrder);
  }

  @Transactional()
  async createOrder(
    userId: string,
    shopId: string,
    shipAddressId: string,
  ): Promise<Order> {
    return await this.ordersRepo.createOrder(userId, shopId, shipAddressId);
  }

  @Transactional()
  async createOrderItem(
    orderId: string,
    orderItemCreateDto: OrderItemCreateDto,
  ): Promise<OrderItem> {
    const lockedProduct =
      await this.productsService.validateAndReserveProductStock(
        orderItemCreateDto.productId,
        orderItemCreateDto.quantity,
      );

    return await this.createOrderItemSnapshot(
      orderId,
      orderItemCreateDto,
      lockedProduct,
    );
  }

  @Transactional()
  async buyNow(
    userId: string,
    buyNowRequestDto: BuyNowRequestDto,
  ): Promise<OrderResponseDto> {
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOfUserOrThrow(
        userId,
        buyNowRequestDto.shipAddressId,
      );
    const reservedProduct =
      await this.productsService.validateAndReserveProductStock(
        buyNowRequestDto.productId,
        buyNowRequestDto.quantity,
      );

    const orderId = await this.createOrderWithItemsForShop(
      userId,
      reservedProduct.shopId,
      shippingAddress.id,
      [{ request: buyNowRequestDto, product: reservedProduct }],
    );

    return await this.getCreatedOrderResponseOrThrow(orderId);
  }

  @Transactional()
  async checkoutCart(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<OrderResponseDto[]> {
    const shippingAddress =
      await this.userAddressesService.findActiveUserAddressEntityByIdOfUserOrThrow(
        userId,
        checkoutRequestDto.shipAddressId,
      );
    const activeCartItems = await this.getActiveUserCartItemsOrThrow(userId);
    const requestedItems = this.sortItemsByProductIdForLocking(
      checkoutRequestDto.items,
    );

    this.validateCheckoutItemsMatchActiveCart(activeCartItems, requestedItems);
    const reservedItemsByShop =
      await this.reserveProductsAndGroupItemsByShop(requestedItems);
    const createdOrderIds = await this.createOrdersForEachShop(
      userId,
      shippingAddress.id,
      reservedItemsByShop,
    );

    await this.cartItemsService.markAllUserCartItemsAsOrderedOrThrow(
      userId,
      activeCartItems.length,
    );
    return await this.getCreatedOrderResponsesOrThrow(createdOrderIds);
  }

  private async getActiveUserCartItemsOrThrow(
    userId: string,
  ): Promise<CartItem[]> {
    return await this.cartItemsService.findAllUserActiveCartItemEntitiesByUserIdOrThrow(
      userId,
    );
  }

  private sortItemsByProductIdForLocking(
    requestedItems: OrderItemCreateDto[],
  ): OrderItemCreateDto[] {
    return [...requestedItems].sort((left, right) =>
      left.productId.localeCompare(right.productId),
    );
  }

  private validateCheckoutItemsMatchActiveCart(
    cartItems: CartItem[],
    requestedItems: OrderItemCreateDto[],
  ): void {
    this.validateCartContainsItems(cartItems);
    this.validateCheckoutIncludesEveryCartItem(cartItems, requestedItems);

    const cartItemByProductId = new Map(
      cartItems.map((cartItem) => [cartItem.productId, cartItem]),
    );
    for (const requestedItem of requestedItems) {
      this.validateRequestedItemMatchesCart(
        requestedItem,
        cartItemByProductId.get(requestedItem.productId),
      );
    }
  }

  private validateCartContainsItems(cartItems: CartItem[]): void {
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }
  }

  private validateCheckoutIncludesEveryCartItem(
    cartItems: CartItem[],
    requestedItems: OrderItemCreateDto[],
  ): void {
    if (requestedItems.length !== cartItems.length) {
      throw new BadRequestException(
        'Checkout items must include every item in the active cart.',
      );
    }
  }

  private validateRequestedItemMatchesCart(
    requestedItem: OrderItemCreateDto,
    cartItem?: CartItem,
  ): void {
    if (!cartItem) {
      throw new BadRequestException(
        `Product ${requestedItem.productId} does not exist in the active cart.`,
      );
    }
    if (cartItem.quantity !== requestedItem.quantity) {
      throw new BadRequestException(
        `Quantity of product ${requestedItem.productId} has changed.`,
      );
    }
  }

  private async reserveProductsAndGroupItemsByShop(
    requestedItems: OrderItemCreateDto[],
  ): Promise<ReservedItemsByShop> {
    const reservedItemsByShop: ReservedItemsByShop = new Map();

    for (const requestedItem of requestedItems) {
      const reservedProduct =
        await this.productsService.validateAndReserveProductStock(
          requestedItem.productId,
          requestedItem.quantity,
        );
      const shopItems = reservedItemsByShop.get(reservedProduct.shopId) ?? [];
      shopItems.push({ request: requestedItem, product: reservedProduct });
      reservedItemsByShop.set(reservedProduct.shopId, shopItems);
    }
    return reservedItemsByShop;
  }

  private async createOrdersForEachShop(
    userId: string,
    shippingAddressId: string,
    reservedItemsByShop: ReservedItemsByShop,
  ): Promise<string[]> {
    const createdOrderIds: string[] = [];

    for (const [shopId, shopItems] of reservedItemsByShop) {
      const orderId = await this.createOrderWithItemsForShop(
        userId,
        shopId,
        shippingAddressId,
        shopItems,
      );
      createdOrderIds.push(orderId);
    }
    return createdOrderIds;
  }

  private async createOrderWithItemsForShop(
    userId: string,
    shopId: string,
    shippingAddressId: string,
    reservedItems: ReservedOrderItem[],
  ): Promise<string> {
    const order = await this.ordersRepo.createOrder(
      userId,
      shopId,
      shippingAddressId,
    );

    for (const { request, product } of reservedItems) {
      await this.createOrderItemSnapshot(order.id, request, product);
    }
    return order.id;
  }

  private async getCreatedOrderResponsesOrThrow(
    orderIds: string[],
  ): Promise<OrderResponseDto[]> {
    const orderResponses: OrderResponseDto[] = [];

    for (const orderId of orderIds) {
      orderResponses.push(await this.getCreatedOrderResponseOrThrow(orderId));
    }
    return orderResponses;
  }

  private async getCreatedOrderResponseOrThrow(
    orderId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersRepo.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Created order not found.');
    }
    return toResponseDto(OrderResponseDto, order);
  }

  private async createOrderItemSnapshot(
    orderId: string,
    orderItemCreateDto: OrderItemCreateDto,
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
