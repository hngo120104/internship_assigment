import { InjectRepository } from '@nestjs/typeorm';
import { UserAddress } from '../entities/user-address.entity';
import { In, Repository } from 'typeorm';
import { UserAddressCreateRequestDto } from '../dto/user-addresses/request/user-address-create.request.dto';
import { UserAddressUpdateRequestDto } from '../dto/user-addresses/request/user-address-update.request.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserAddressesRepository {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressesRepository: Repository<UserAddress>,
  ) {}

  async findActiveUserAddressById(
    userId: string,
    addressId: string,
  ): Promise<UserAddress | null> {
    return await this.userAddressesRepository.findOneBy({
      id: addressId,
      userId,
      isDeleted: false,
    });
  }
  async createAddress(
    userId: string,
    userAddressesCreateDto: UserAddressCreateRequestDto,
  ): Promise<UserAddress> {
    const newUserAddress = this.userAddressesRepository.create({
      userId: userId,
      ...userAddressesCreateDto,
    });
    return await this.userAddressesRepository.save(newUserAddress);
  }

  async updateUserAddress(
    userId: string,
    addressId: string,
    userAddressesUpdateDto: UserAddressUpdateRequestDto,
  ): Promise<UserAddress> {
    const existingAddress = await this.userAddressesRepository.findOneBy({
      id: addressId,
      userId,
      isDeleted: false,
    });
    if (!existingAddress) {
      throw new NotFoundException('UserAddress does not exist.');
    }
    Object.assign(existingAddress, userAddressesUpdateDto);
    return await this.userAddressesRepository.save(existingAddress);
  }

  async softDeleteUserAddresses(
    userId: string,
    userAddressIds: string[],
  ): Promise<number> {
    const deleteResult = await this.userAddressesRepository.update(
      { userId: userId, id: In(userAddressIds), isDeleted: false },
      { isDeleted: true },
    );
    return deleteResult.affected ?? 0;
  }
}
