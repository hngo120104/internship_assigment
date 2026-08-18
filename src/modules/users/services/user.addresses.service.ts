import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserAddressesRepository } from '../repositories/user.addresses.repository';
import { UserAddressCreateRequestDto } from '../dto/user.addresses/request/user.address.create.request.dto';
import { UserAddressResponseDto } from '../dto/user.addresses/response/user.address.reponse.dto';
import { Address } from '../entities/user.address.entity';
import { UserAddressUpdateRequestDto } from '../dto/user.addresses/request/user.address.update.request.dto';
import { toResponseDto } from '../../../utils/to.dto.response';

@Injectable()
export class UserAddressesService {
  constructor(private readonly userAddressesRepo: UserAddressesRepository) {}

  async findActiveUserAddressEntityByIdOrThrow(
    userId: string,
    addressId: string,
  ): Promise<Address> {
    const address = await this.userAddressesRepo.findActiveUserAddressById(
      userId,
      addressId,
    );
    if (!address) {
      throw new NotFoundException('User address not found.');
    }
    return address;
  }

  async createNewUserAddress(
    userId: string,
    userAddressesCreateDto: UserAddressCreateRequestDto,
  ): Promise<UserAddressResponseDto> {
    const newUserAddress = await this.userAddressesRepo.createAddress(
      userId,
      userAddressesCreateDto,
    );
    return toResponseDto(UserAddressResponseDto, newUserAddress);
  }

  async updateUserAddress(
    userId: string,
    addressId: string,
    userAddressesUpdateDto: UserAddressUpdateRequestDto,
  ): Promise<UserAddressResponseDto> {
    const updatedAddresses = await this.userAddressesRepo.updateUserAddress(
      userId,
      addressId,
      userAddressesUpdateDto,
    );
    return toResponseDto(UserAddressResponseDto, updatedAddresses);
  }

  async deleteUserAddressesOrThrow(
    userId: string,
    addressIds: string[],
  ): Promise<number> {
    if (addressIds.length === 0) {
      throw new BadRequestException('Addresses must not be empty.');
    }
    const deleteResult = await this.userAddressesRepo.softDeleteUserAddresses(
      userId,
      addressIds,
    );
    if (deleteResult !== addressIds.length) {
      throw new NotFoundException('Some addresses might already be deleted.');
    }
    return deleteResult;
  }
}
