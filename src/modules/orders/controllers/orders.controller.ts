import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { FindOrderRequestDto } from '../dto/request/find.order.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { OrderUpdateRequestDto } from '../dto/request/order.update.request.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('users')
  @SerializeOptions({ groups: ['order-details'] })
  async findAllUserOrders(
    @CurrentUser() user: CurrentUserPayload,
    @Query() findOrderRequestDto: FindOrderRequestDto,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    return await this.ordersService.findAllUserOrdersWithOptionalStatusesByUserIdOrThrow(
      user.userId,
      findOrderRequestDto,
    );
  }

  @Get('users/:orderId')
  @SerializeOptions({ groups: ['order-details'] })
  async findUserOrderByOrderId(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const response =
      await this.ordersService.findUserOrderByUserIdAndOrderIdOrThrow(
        user.userId,
        orderId,
      );
    return response;
  }

  @Patch('users/:orderId/cancellation')
  @SerializeOptions({ groups: ['order-details'] })
  async userCancelOrder(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
    @Body() request: OrderUpdateRequestDto,
  ) {
    return await this.ordersService.updateOrderByOrderId(
      user.userId,
      orderId,
      request,
    );
  }

  @Get('shops')
  @Roles(Role.SELLER)
  @SerializeOptions({ groups: ['order-details'] })
  async findAllShopOrdersWithQueryOptions(
    @CurrentUser() user: CurrentUserPayload,
    @Query() findOrderRequestDto: FindOrderRequestDto,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    return await this.ordersService.findAllShopOrdersWithOptionStatusesByShopIdOrThrow(
      findOrderRequestDto,
      user.shopId,
    );
  }

  @Get('shops/:orderId')
  @Roles(Role.SELLER)
  @SerializeOptions({ groups: ['order-details'] })
  async findShopOrderDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.findShopOrderByUserIdAndOrderIdOrThrow(
      orderId,
      user.shopId,
    );
  }

  @Patch('shops/:orderId/confirmation')
  @SerializeOptions({ groups: ['order-details'] })
  @Roles(Role.SELLER)
  async shopConfirmOrder(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.shopConfirmOrderOrThrow(
      orderId,
      user.shopId,
    );
  }

  @Post('checkout')
  @SerializeOptions({ groups: ['customer-order'] })
  async checkoutCart(
    @CurrentUser() user: CurrentUserPayload,
    @Body() checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    return await this.ordersService.checkoutCart(
      user.userId,
      checkoutRequestDto,
    );
  }

  @Post('buy-now')
  @SerializeOptions({ groups: ['order-details'] })
  async buyNow(
    @CurrentUser() user: CurrentUserPayload,
    @Body() buyNowRequestDto: BuyNowRequestDto,
  ): Promise<ShopOrderResponseDto> {
    return await this.ordersService.buyNow(user.userId, buyNowRequestDto);
  }
}
