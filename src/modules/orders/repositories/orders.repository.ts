import { FindOptionsWhere, Repository } from 'typeorm';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserAddress } from '../../users/entities/user-address.entity';

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
      userId: userId,
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    if (paymentStatus) whereConditions.paymentStatus = paymentStatus;
    return await this.ordersRepository.findAndCount({
      where: whereConditions,
      relations: { shipAddress: true, orderItems: true },
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
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    if (paymentStatus) whereConditions.paymentStatus = paymentStatus;
    return await this.ordersRepository.findAndCount({
      where: whereConditions,
      relations: { shipAddress: true, orderItems: true },
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
    return await this.ordersRepository
      .createQueryBuilder('orders')
      .setLock('pessimistic_write')
      .leftJoinAndSelect('orders.orderItems', 'orderItems')
      .where('orders.id = :orderId', { orderId: orderId })
      .andWhere('userId = :userId', { userId: userId })
      .andWhere('orders.orderStatus IN (:...OrderStatus)', {
        OrderStatus: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
      })
      .andWhere('orders.paymentStatus IN (:...PaymentStatus)', {
        PaymentStatus: [PaymentStatus.PENDING, PaymentStatus.PAID],
      })
      .getOne();
  }

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
      .andWhere('orders.paymentStatus IN (:...PaymentStatus)', {
        PaymentStatus: [PaymentStatus.PENDING, PaymentStatus.PAID],
      })
      .getOne();
  }

  async findOrderByUserIdAndOrderId(
    userId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository.findOne({
      where: { userId: userId, id: orderId },
      relations: { shipAddress: true, orderItems: true },
    });
  }

  async findOrderByShopIdAndOrderId(
    shopId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepository.findOne({
      where: { shopId: shopId, id: orderId },
      relations: { shipAddress: true, orderItems: true },
    });
  }

  createOrder(
    userId: string,
    shopId: string,
    shippingAddress: UserAddress,
    paymentMethod: PaymentMethod,
  ): Order {
    return this.ordersRepository.create({
      userId,
      shopId,
      shippingAddressId: shippingAddress.id,
      shipAddress: shippingAddress,
      discount: 0,
      shippingFee: 0,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: paymentMethod,
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
