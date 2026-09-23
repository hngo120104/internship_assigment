import { FindOptionsWhere, Repository, In } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '../../checkouts/enums/payment-status.enum';
import { randomUUID } from 'crypto';

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
      checkout: { userId: userId },
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    if (paymentStatus)
      whereConditions.checkout = {
        paymentStatus: paymentStatus,
      };
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

  //TODO: revise where conditions of payment
  async findAllShopOrdersWithOptionStatusesByShopId(
    shopId: string,
    page: number,
    size: number,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<[Order[], number]> {
    const whereConditions: FindOptionsWhere<Order> = {
      shopId: shopId,
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    if (paymentStatus)
      whereConditions.checkout = { paymentStatus: paymentStatus };
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

  //TODO: where condition of payment need to be revised
  async findOrderByUserIdAndOrderIdAndLockForCancel(
    userId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository.findOne({
      where: {
        checkout: { userId: userId },
        id: orderId,
        orderStatus: In([
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
        ]),
        shop: { isDeleted: false },
      },
    });
  }

  //TODO: where condition of payment need to be revised
  async findOrderByShopIdAndOrderIdAndLock(
    shopId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository
      .createQueryBuilder('orders')
      .setLock('pessimistic_write')
      .leftJoinAndSelect('orders.orderItems', 'orderItems')
      .where('orders.id = :orderId', { orderId: orderId })
      .andWhere('shopId = :shopId', { shopId: shopId })
      .andWhere('orders.orderStatus = :OrderStatus', {
        OrderStatus: OrderStatus.PENDING,
      })
      .getOne();
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
