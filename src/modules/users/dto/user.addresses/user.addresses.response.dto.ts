import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserAddressesResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose({ name: 'recipientName' })
  recipient_name!: string;

  @Expose({ name: 'phoneNumber' })
  phone_number!: string;

  @Expose()
  province!: string;

  @Expose()
  district!: string;

  @Expose({ name: 'addressLine' })
  address_line!: string;

  @Expose({ name: 'isPrimary' })
  is_primary!: boolean;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;

  @Expose({ name: 'isDeleted' })
  is_deleted!: boolean;
}
