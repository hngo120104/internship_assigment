import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
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

  async findOneWithOptions(
    options: FindOneOptions<Order>,
  ): Promise<Order | null> {
    return await this.ordersRepo.findOne(options);
  }

  async findManyWithOptions(options: FindManyOptions<Order>): Promise<Order[]> {
    return await this.ordersRepo.find(options);
  }

  async findAllUserOrders(userId: string): Promise<Order[]> {
    return await this.ordersRepo.find({
      where: { userId: userId },
      relations: { orderItems: true, shipAddress: true },
    });
  }

  async findUserShopPendingOrdersByShopId(shopId: string): Promise<Order[]> {
    return await this.ordersRepo.find({
      where: {
        shopId: shopId,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      relations: { shipAddress: true, orderItems: true },
    });
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

  async findOrderById(orderId: string): Promise<Order | null> {
    return await this.ordersRepo.findOne({
      where: { id: orderId, orderStatus: OrderStatus.PENDING },
      relations: {
        orderItems: true,
        shipAddress: true,
      },
    });
  }

  async shopConfirmOrderByOrderId(
    shopId: string,
    orderId: string,
  ): Promise<boolean> {
    const confirmResult = await this.ordersRepo.update(
      {
        id: orderId,
        shopId: shopId,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: In([PaymentStatus.PAID, PaymentStatus.PENDING]),
      },
      { orderStatus: OrderStatus.CONFIRMED },
    );
    return confirmResult.affected === 1;
  }

  async userCancelOrderByOrderId(
    userId: string,
    orderId: string,
  ): Promise<boolean> {
    const cancelResult = await this.ordersRepo.update(
      {
        userId: userId,
        id: orderId,
      },
      { orderStatus: OrderStatus.CANCELLED },
    );
    return cancelResult.affected === 1;
  }
}
