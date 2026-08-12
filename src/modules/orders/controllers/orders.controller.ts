import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { ShopOrderResponseDto } from '../dto/shop.order.response.dto';
import { CheckoutRequestDto } from '../dto/checkout.request.dto';
import { BuyNowRequestDto } from '../dto/buynow.request.dto';
import { CustomerOrderCreateResponseDto } from '../dto/customer.order.response.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('user')
  async getUserPendingOrderByUserId(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.findUserPendingOrderByUserIdOrThrow(
      user.sub,
    );
  }

  @Post('checkout')
  async checkoutCart(
    @CurrentUser() user: CurrentUserPayload,
    @Body() checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CustomerOrderCreateResponseDto> {
    return await this.ordersService.checkoutCart(user.sub, checkoutRequestDto);
  }

  @Post('buy-now')
  async buyNow(
    @CurrentUser() user: CurrentUserPayload,
    @Body() buyNowRequestDto: BuyNowRequestDto,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.buyNow(user.sub, buyNowRequestDto);
  }
}
