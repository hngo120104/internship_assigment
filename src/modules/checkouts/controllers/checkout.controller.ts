import { Controller, Post, Body, SerializeOptions } from '@nestjs/common';
import { CurrentUser } from '../../../custom-decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../custom-decorators/current-user.decorator';
import { CheckoutsService } from '../services/checkout.service';
import { CheckoutRequestDto } from '../dto/requests/checkout.request.dto';
import { CheckoutResponseDto } from '../dto/responses/checkout.response.dto';
import { BuyNowRequestDto } from '../dto/requests/buy-now.request.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutsService: CheckoutsService) {}
  @Post('carts')
  @SerializeOptions({ groups: ['customer-order'] })
  async checkoutCart(
    @CurrentUser() user: CurrentUserPayload,
    @Body() checkoutRequestDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    return await this.checkoutsService.checkoutCart(
      user.userId,
      checkoutRequestDto,
    );
  }

  @Post('buy-now')
  @SerializeOptions({ groups: ['order-details'] })
  async buyNow(
    @CurrentUser() user: CurrentUserPayload,
    @Body() buyNowRequestDto: BuyNowRequestDto,
  ): Promise<CheckoutResponseDto> {
    return await this.checkoutsService.buyNow(user.userId, buyNowRequestDto);
  }
}
