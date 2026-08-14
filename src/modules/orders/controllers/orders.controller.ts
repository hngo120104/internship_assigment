import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { ShopOrderResponseDto } from '../dto/response/shop.order.response.dto';
import { CheckoutRequestDto } from '../dto/request/checkout.request.dto';
import { BuyNowRequestDto } from '../dto/request/buynow.request.dto';
import { CheckoutResponseDto } from '../dto/response/customer.order.response.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('users')
  @SerializeOptions({ groups: ['order-details'] })
  async findAllUserOrders(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ShopOrderResponseDto[]> {
    return await this.ordersService.findAllUserOrdersByUserIdOrThrow(user.sub);
  }

  @Get(':orderId')
  @SerializeOptions({ groups: ['order-details'] })
  async findUserOrderByUserId(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const response = await this.ordersService.findUserOrderByUserIdOrThrow(
      user.sub,
      orderId,
    );
    return response;
  }

  @Patch('users/:orderId')
  async userCancelOrder(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ) {
    return await this.ordersService.userCancelOrderOrThrow(user.sub, orderId);
  }

  @Get('shops/pending')
  @Roles(Role.SELLER)
  @SerializeOptions({ groups: ['order-details'] })
  async findUserShopPendingOrdersByUserId(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ShopOrderResponseDto[]> {
    return await this.ordersService.findUserShopPendingOrderByUserIdOrThrow(
      user.sub,
    );
  }

  @Patch('shops/:orderId/confirm')
  @SerializeOptions({ groups: ['order-details'] })
  async shopConfirmOrder(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.shopConfirmOrderOrThrow(user.sub, orderId);
  }

  @Post('checkout')
  @SerializeOptions({ groups: ['customer-order'] })
  async checkoutCart(
    @CurrentUser() user: CurrentUserPayload,
    @Body() checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    return await this.ordersService.checkoutCart(user.sub, checkoutRequestDto);
  }

  @Post('buy-now')
  @SerializeOptions({ groups: ['order-details'] })
  async buyNow(
    @CurrentUser() user: CurrentUserPayload,
    @Body() buyNowRequestDto: BuyNowRequestDto,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.buyNow(user.sub, buyNowRequestDto);
  }
}
