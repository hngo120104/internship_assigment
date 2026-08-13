import { Expose, Transform } from 'class-transformer';

export class CartItemDeleteResponseDto {
  @Expose({ name: 'deleted_amount' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  deletedAmount!: number;

  @Expose()
  message!: 'Success';
}
