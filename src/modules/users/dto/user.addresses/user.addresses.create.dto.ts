import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserAddressesCreateDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'recipient_name' })
  @MaxLength(255, { message: 'Recipient name is too long.' })
  recipientName!: string;

  @Expose({ name: 'phone_number' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Recipient name is too long.' })
  province!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'District is too long.' })
  district!: string;

  @Expose({ name: 'address_line' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Address line is too long.' })
  addressLine!: string;

  @Expose({ name: 'is_primary' })
  @IsBoolean()
  @IsNotEmpty()
  isPrimary!: boolean;
}
