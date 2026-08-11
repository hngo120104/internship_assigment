import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../entities/order.item.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
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

  async findOneWithOptions(
    options: FindOneOptions<OrderItem>,
  ): Promise<OrderItem | null> {
    return await this.orderItemsRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<OrderItem>,
  ): Promise<OrderItem[]> {
    return await this.orderItemsRepo.find(options);
  }

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
