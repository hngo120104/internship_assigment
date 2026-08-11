import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../entities/order.item.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

export type CreateOrderItemData = Pick<
  OrderItem,
  'productId' | 'productName' | 'quantity' | 'unitPrice' | 'note'
>;

@Injectable()
export class OrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
  ) {}

  async createOrderItem(
    orderId: string,
    data: CreateOrderItemData,
  ): Promise<OrderItem> {
    const newOrderItem = this.orderItemsRepo.create({
      orderId,
      ...data,
    });
    return await this.orderItemsRepo.save(newOrderItem);
  }
}
