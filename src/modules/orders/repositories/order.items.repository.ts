import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../entities/order.item.entity';
import { Repository } from 'typeorm';
import { OrderItemCreateDto } from '../dto/order.item.create.dto';
import { randomUUID } from 'crypto';

export class OrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
  ) {}

  async createOrderItem(
    orderId: string,
    fullOrderItemCreateDto: any,
  ): Promise<OrderItem> {
    const newOrderItem = this.orderItemsRepo.create({
        id: randomUUID(),
        orderId: orderId,
        ...fullOrderItemCreateDto
    });
  }
}
