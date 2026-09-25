import { FindOptionsWhere, Repository, In } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '../../checkouts/enums/payment-status.enum';
import { randomUUID } from 'crypto';
import { CheckoutStatus } from '../../checkouts/enums/checkout-status.enum';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async findAllUserOrdersWithOptionalStatusesByUserId(
    userId: string,
    page: number,
    size: number,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<[Order[], number]> {
    const whereConditions: FindOptionsWhere<Order> = {
      checkout: {
        userId: userId,
        ...(paymentStatus && { paymentStatus: paymentStatus }),
      },
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;

    return await this.ordersRepository.findAndCount({
      where: whereConditions,
      relations: { orderItems: true },
      skip: (page - 1) * size,
      take: size,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllShopOrdersWithOptionStatusesByShopId(
    shopId: string,
    page: number,
    size: number,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<[Order[], number]> {
    const whereConditions: FindOptionsWhere<Order> = {
      shopId: shopId,
      checkout: { ...(paymentStatus && { paymentStatus: paymentStatus }) },
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    return await this.ordersRepository.findAndCount({
      where: whereConditions,
      relations: { orderItems: true },
      skip: (page - 1) * size,
      take: size,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOrderByUserIdAndOrderIdAndLockForCancel(
    userId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository.findOne({
      where: {
        checkout: {
          userId: userId,
          status: In([CheckoutStatus.COMPLETED, CheckoutStatus.PROCESSING]),
          paymentStatus: In([PaymentStatus.PAID, PaymentStatus.PENDING]),
        },
        id: orderId,
        orderStatus: In([
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
        ]),
        shop: { isDeleted: false },
      },
      relations: {
        checkout: true,
        orderItems: true,
      },
    });
  }

  async findOrderByUserIdAndOrderId(
    userId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository.findOne({
      where: { checkout: { userId: userId }, id: orderId },
      relations: { orderItems: true },
    });
  }

  async findOrderByShopIdAndOrderId(
    shopId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository.findOne({
      where: { shopId: shopId, id: orderId },
      relations: { orderItems: true },
    });
  }

  createOrder(shopId: string): Order {
    return this.ordersRepository.create({
      orderCode: randomUUID(),
      shopId,
      discount: 0,
      shippingFee: 0,
      orderStatus: OrderStatus.PENDING,
    });
  }

  async shopConfirmOrderByOrderId(
    shopId: string,
    orderId: string,
  ): Promise<boolean> {
    const confirmResult = await this.ordersRepository.update(
      { id: orderId, shopId: shopId, orderStatus: OrderStatus.PENDING },
      { orderStatus: OrderStatus.CONFIRMED },
    );
    return confirmResult.affected === 1;
  }

  async shopProcessOrderByOrderId(
    shopId: string,
    orderId: string,
  ): Promise<boolean> {
    const result = await this.ordersRepository.update(
      { id: orderId, shopId: shopId, orderStatus: OrderStatus.CONFIRMED },
      { orderStatus: OrderStatus.PROCESSING },
    );
    return result.affected === 1;
  }

  async shopSendOrderToShipByOrderId(
    shopId: string,
    orderId: string,
  ): Promise<boolean> {
    const result = await this.ordersRepository.update(
      { id: orderId, shopId: shopId, orderStatus: OrderStatus.PROCESSING },
      { orderStatus: OrderStatus.SHIPPING },
    );
    return result.affected === 1;
  }

  async saveOrders(orders: Order[]): Promise<Order[]> {
    return await this.ordersRepository.save(orders);
  }
}
