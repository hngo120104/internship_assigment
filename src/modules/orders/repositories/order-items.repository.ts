import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';

export type CreateOrderItemData = Pick<
  OrderItem,
  | 'variantId'
  | 'productName'
  | 'variantSize'
  | 'variantColor'
  | 'quantity'
  | 'unitPrice'
  | 'note'
>;

@Injectable()
export class OrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  createOrderItem(order: Order, data: CreateOrderItemData): OrderItem {
    return this.orderItemsRepository.create({
      order: order,
      ...data,
    });
  }

  async saveOrderItem(orderItems: OrderItem[]): Promise<OrderItem[]> {
    return await this.orderItemsRepository.save(orderItems);
  }
}
