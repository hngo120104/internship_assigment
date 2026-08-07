import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { OrderItemCreateDto } from '../dto/order.item.create.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('')
  async createOrder(
    @CurrentUser() user: CurrentUserPayload,
    @Body() orderItemCreateDtos: OrderItemCreateDto[],
  ): Promise<OrderReponseDto> {
    return await this.ordersService.createOrder(user.sub, orderItemCreateDtos);
  }
}
