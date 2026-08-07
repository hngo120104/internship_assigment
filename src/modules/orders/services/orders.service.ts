import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderItemsRepository } from '../repositories/order.items.repository';
import { Transactional } from 'typeorm-transactional';
import { OrderItemCreateDto } from '../dto/order.item.create.dto';
import { OrderResponseDto } from '../dto/order.reponse.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly orderItemsRepo: OrderItemsRepository,
  ) {}

  @Transactional()
  async createOrder(
    userId: string,
    orderItemCreateDtos: OrderItemCreateDto[],
  ): Promise<OrderResponseDto> {
    const userOrder = await this.ordersRepo.createOrder(userId);
  }
}
