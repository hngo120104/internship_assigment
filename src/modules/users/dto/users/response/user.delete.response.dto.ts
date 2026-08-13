import { Expose } from 'class-transformer';

export class UserDeleteResponseDto {
  @Expose()
  amount!: number;

  @Expose()
  message!: 'Success.';
}
