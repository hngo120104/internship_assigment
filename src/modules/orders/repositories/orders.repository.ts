import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  async createOrder(
    userId: string,
    shopId: string,
    shipAddressId: string,
  ): Promise<Order> {
    const createdOrder = this.ordersRepo.create({
      userId,
      shopId,
      shipAddressId,
      discount: 0,
      shippingFee: 0,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
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
}
