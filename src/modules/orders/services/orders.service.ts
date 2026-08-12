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
import { Product } from '../../products/entities/product.entity';
import { BuyNowRequestDto } from '../dto/buynow.request.dto';
import { ShopOrderResponseDto } from '../dto/shop.order.response.dto';
import { UsersService } from '../../users/services/users.service';
import { UserAddressesService } from '../../users/services/user.addresses.service';
import { CheckoutRequestDto } from '../dto/checkout.request.dto';
import { CartItemsService } from '../../carts/services/cart.items.service';
import { toResponseDto } from '../../../utils/to.dto.response';
import { Order, PaymentMethod } from '../entities/order.entity';
import { CartItem } from '../../carts/entities/cart.item.entity';
import { CustomerOrderCreateResponseDto } from '../dto/customer.order.response.dto';
import { plainToInstance } from 'class-transformer';
import { Address } from '../../users/entities/user.address.entity';

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

  async findUserPendingOrderByUserIdOrThrow(
    userId: string,
  ): Promise<ShopOrderResponseDto> {
    const foundPendingOrder =
      await this.ordersRepo.findPendingOrderByUserId(userId);
    if (!foundPendingOrder) {
      throw new NotFoundException('User does not have pending order.');
    }
    return toResponseDto(ShopOrderResponseDto, foundPendingOrder);
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

    return toResponseDto(ShopOrderResponseDto, order, ['customer-order']);
  }

  @Transactional()
  async checkoutCart(
    userId: string,
    checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CustomerOrderCreateResponseDto> {
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
    response.grand_total = this.calculateGrandTotal(createdOrders);
    return response;
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

  private toCustomerOrderResponse(
    orders: Order[],
  ): CustomerOrderCreateResponseDto {
    return plainToInstance(
      CustomerOrderCreateResponseDto,
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
    orderItemCreateDtos: OrderItemCreateDto[],
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
    orderItemCreateDtos: OrderItemCreateDto[],
  ): OrderItemCreateDto[] {
    return [...orderItemCreateDtos].sort((left, right) =>
      left.productId.localeCompare(right.productId),
    );
  }

  private async reserveProductsAndGroupItemsByShop(
    orderItemCreateDtos: OrderItemCreateDto[],
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
