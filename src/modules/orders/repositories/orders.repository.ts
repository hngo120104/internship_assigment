import { FindOptionsWhere, Repository } from 'typeorm';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Address } from '../../users/entities/user.address.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  async findAllUserOrdersWithOptionalStatusesByUserId(
    userId: string,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<Order[]> {
    const whereConditions: FindOptionsWhere<Order> = {
      userId: userId,
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    if (paymentStatus) whereConditions.paymentStatus = paymentStatus;
    return await this.ordersRepo.find({
      where: whereConditions,
      relations: { shipAddress: true, orderItems: true },
    });
  }

  async findAllShopOrdersWithOptionStatusesByShopId(
    shopId: string,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<Order[]> {
    const whereConditions: FindOptionsWhere<Order> = {
      shopId: shopId,
    };
    if (orderStatus) whereConditions.orderStatus = orderStatus;
    if (paymentStatus) whereConditions.paymentStatus = paymentStatus;
    return await this.ordersRepo.find({
      where: whereConditions,
      relations: { shipAddress: true, orderItems: true },
    });
  }

  async findOrderByUserIdAndOrderIdAndLock(
    userId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepo
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
    return await this.ordersRepo
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
    return await this.ordersRepo.findOne({
      where: { userId: userId, id: orderId },
      relations: { shipAddress: true, orderItems: true },
    });
  }

  async findOrderByShopIdAndOrderId(
    shopId: string,
    orderId: string,
  ): Promise<Order | null> {
    return await this.ordersRepo.findOne({
      where: { shopId: shopId, id: orderId },
      relations: { shipAddress: true, orderItems: true },
    });
  }

  async createOrder(
    userId: string,
    shopId: string,
    shipAddressId: string,
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
  ): Promise<Order> {
    const createdOrder = this.ordersRepo.create({
      userId,
      shopId,
      shipAddressId: shipAddressId,
      shipAddress: shippingAddress,
      discount: 0,
      shippingFee: 0,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: paymentMethod,
    });
    return await this.ordersRepo.save(createdOrder);
  }

  async saveOrder(order: Order): Promise<Order> {
    return await this.ordersRepo.save(order);
  }
}
