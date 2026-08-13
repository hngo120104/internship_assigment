import { Expose, Transform } from 'class-transformer';

export class UserAddressResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'user_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  userId!: string;

  @Expose({ name: 'recipient_name' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  recipientName!: string;

  @Expose({ name: 'phone_number' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  phoneNumber!: string;

  @Expose()
  province!: string;

  @Expose()
  district!: string;

  @Expose({ name: 'address_line' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  addressLine!: string;

  @Expose({ name: 'is_primary' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  isPrimary!: boolean;

  @Expose({ name: 'created_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  updatedAt!: Date;

  @Expose({ name: 'is_deleted' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  isDeleted!: boolean;
}
