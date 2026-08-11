import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserAddressesRepository } from '../repositories/user.addresses.repository';
import { UserAddressesCreateDto } from '../dto/user.addresses/user.addresses.create.dto';
import { UserAddressesResponseDto } from '../dto/user.addresses/user.addresses.response.dto';
import { Address } from '../entities/user.address.entity';
import { plainToInstance } from 'class-transformer';
import { UserAddressesUpdateDto } from '../dto/user.addresses/user.addresses.update.dto';

@Injectable()
export class UserAddressesService {
  constructor(private readonly userAddressesRepo: UserAddressesRepository) {}

  async findPrimaryUserAddressByUserId(userId: string): Promise<Address> {
    const foundAddress =
      await this.userAddressesRepo.findPrimaryUserAddressByUserId(userId);
    if (!foundAddress) {
      throw new NotFoundException('User address not found.');
    }
    return foundAddress;
  }

  async findActiveUserAddressById(
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
    return this.toUserAddressResponseDto(newUserAddress);
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
    return this.toUserAddressResponseDto(updatedAddresses);
  }

  async deleteUserAddresses(
    userId: string,
    addressIds: string[],
  ): Promise<void> {
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
  }

  private toUserAddressResponseDto(
    userAddress: Address,
  ): UserAddressesResponseDto {
    return plainToInstance(UserAddressesResponseDto, userAddress, {
      excludeExtraneousValues: true,
    });
  }
}
