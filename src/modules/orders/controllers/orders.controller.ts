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

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('users')
  @SerializeOptions({ groups: ['order-details'] })
  async findAllUserOrders(
    @CurrentUser() user: CurrentUserPayload,
    @Query() findOrderRequestDto: FindOrderRequestDto,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    return new ListResponseDto(
      await this.ordersService.findAllUserOrdersWithOptionalStatusesByUserIdOrThrow(
        user.sub,
        findOrderRequestDto.orderStatus,
        findOrderRequestDto.paymentStatus,
      ),
    );
  }

  @Get('users/:orderId')
  @SerializeOptions({ groups: ['order-details'] })
  async findUserOrderByUserId(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ): Promise<ShopOrderResponseDto> {
    const response =
      await this.ordersService.findUserOrderByUserIdAndOrderIdOrThrow(
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

  @Get('shops')
  @Roles(Role.SELLER)
  @SerializeOptions({ groups: ['order-details'] })
  async findAllShopOrdersWithQueryOptions(
    @CurrentUser() user: CurrentUserPayload,
    @Query() findOrderRequestDto: FindOrderRequestDto,
  ): Promise<ListResponseDto<ShopOrderResponseDto>> {
    return new ListResponseDto(
      await this.ordersService.findAllShopOrdersWithOptionStatusesByShopIdOrThrow(
        user.sub,
        findOrderRequestDto.orderStatus,
        findOrderRequestDto.paymentStatus,
      ),
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
      user.sub,
      orderId,
    );
  }

  @Patch('shops/:orderId/confirm')
  @SerializeOptions({ groups: ['order-details'] })
  @Roles(Role.SELLER)
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
