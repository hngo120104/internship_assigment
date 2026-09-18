import { Repository } from 'typeorm';
import { Checkout } from '../entities/checkout.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Injectable } from '@nestjs/common';
export type CreateCheckoutData = Pick<
  Checkout,
  | 'idempotencyKey'
  | 'orders'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'shippingAddress'
  | 'status'
  | 'shippingAddressId'
  | 'userId'
>;

@Injectable()
export class CheckoutRepository {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
  ) {}

  async checkIdempotency(
    userId: string,
    idempotencyKey: string,
  ): Promise<boolean> {
    return await this.checkoutRepository.existsBy({
      userId: userId,
      idempotencyKey: idempotencyKey,
    });
  }

  createCheckout(data: CreateCheckoutData): Checkout {
    return this.checkoutRepository.create({
      ...data,
      paymentStatus: PaymentStatus.PENDING,
    });
  }

  async saveCheckout(checkout: Checkout): Promise<Checkout> {
    return await this.checkoutRepository.save(checkout);
  }
}
