import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  async createOrder(userId: string): Promise<Order> {
    const createdOrder = await this.ordersRepo.create({
      id: randomUUID(),
      userId: userId,
    });
  }
}
