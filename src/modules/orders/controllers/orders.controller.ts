import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { OrderResponseDto } from '../dto/order.response.dto';
import { CheckoutRequestDto } from '../dto/checkout.request.dto';
import { BuyNowRequestDto } from '../dto/buynow.request.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async checkoutCart(
    @CurrentUser() user: CurrentUserPayload,
    @Body() checkoutRequestDto: CheckoutRequestDto,
  ): Promise<OrderResponseDto[]> {
    return await this.ordersService.checkoutCart(user.sub, checkoutRequestDto);
  }

  @Post('buy-now')
  async buyNow(
    @CurrentUser() user: CurrentUserPayload,
    @Body() buyNowRequestDto: BuyNowRequestDto,
  ): Promise<OrderResponseDto> {
    return await this.ordersService.buyNow(user.sub, buyNowRequestDto);
  }
}
