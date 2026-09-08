import { Expose } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UserAddressesDeleteRequestDto {
  @Expose({ name: 'address_ids' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique({ message: 'Addresses cannot be duplicated.' })
  @IsUUID('all', { each: true })
  addressIds!: string[];
}
