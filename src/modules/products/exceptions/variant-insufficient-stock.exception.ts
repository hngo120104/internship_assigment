import { InvalidVariantAmountResult } from '../interfaces/invalid-variant-amount-result.interface';
import { ConflictException } from '@nestjs/common';

export class InsufficientVariantAmountException extends ConflictException {
  constructor(public readonly variants: InvalidVariantAmountResult[]) {
    super({
      message: 'Insufficient variant amount',
      variants,
    });
  }
}
