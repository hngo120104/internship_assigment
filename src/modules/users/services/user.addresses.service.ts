import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserAddressesRepository } from '../repositories/user.addresses.repository';
import { UserAddressesCreateDto } from '../dto/user.addresses/user.addresses.create.dto';
import { UserAddressesResponseDto } from '../dto/user.addresses/user.addresses.response.dto';
import { Address } from '../entities/user.address.entity';
import { UserAddressesUpdateDto } from '../dto/user.addresses/user.addresses.update.dto';
import { toResponseDto } from '../../../utils/to.dto.response';

@Injectable()
export class UserAddressesService {
  constructor(private readonly userAddressesRepo: UserAddressesRepository) {}

  async findPrimaryUserAddressEntityByUserIdOrThrow(
    userId: string,
  ): Promise<Address> {
    const foundAddress =
      await this.userAddressesRepo.findPrimaryUserAddressByUserId(userId);
    if (!foundAddress) {
      throw new NotFoundException('User address not found.');
    }
    return foundAddress;
  }

  async findActiveUserAddressEntityByIdOfUserOrThrow(
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
    userAddressesCreateDto: UserAddressesCreateDto,
  ): Promise<UserAddressesResponseDto> {
    const newUserAddress = await this.userAddressesRepo.createAddress(
      userId,
      userAddressesCreateDto,
    );
    return toResponseDto(UserAddressesResponseDto, newUserAddress);
  }

  async updateUserAddress(
    userId: string,
    addressId: string,
    userAddressesUpdateDto: UserAddressesUpdateDto,
  ): Promise<UserAddressesResponseDto> {
    const updatedAddresses = await this.userAddressesRepo.updateUserAddress(
      userId,
      addressId,
      userAddressesUpdateDto,
    );
    return toResponseDto(UserAddressesResponseDto, updatedAddresses);
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
