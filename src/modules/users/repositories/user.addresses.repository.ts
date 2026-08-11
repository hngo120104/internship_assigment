import { InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entities/user.address.entity';
import { In, Repository } from 'typeorm';
import { UserAddressesCreateDto } from '../dto/user.addresses/user.addresses.create.dto';
import { UserAddressesUpdateDto } from '../dto/user.addresses/user.addresses.update.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserAddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly userAddressesRepo: Repository<Address>,
  ) {}

  async findPrimaryUserAddressByUserId(
    userId: string,
  ): Promise<Address | null> {
    const foundAddress = await this.userAddressesRepo.findOne({
      where: { userId: userId, isDeleted: false, isPrimary: true },
    });
    return foundAddress;
  }

  async findActiveUserAddressById(
    userId: string,
    addressId: string,
  ): Promise<Address | null> {
    return await this.userAddressesRepo.findOneBy({
      id: addressId,
      userId,
      isDeleted: false,
    });
  }

  async createAddress(
    userId: string,
    userAddressesCreateDto: UserAddressesCreateDto,
  ): Promise<Address> {
    const newUserAddress = this.userAddressesRepo.create({
      userId: userId,
      ...userAddressesCreateDto,
    });
    return await this.userAddressesRepo.save(newUserAddress);
  }

  async updateUserAddress(
    userId: string,
    addressId: string,
    userAddressesUpdateDto: UserAddressesUpdateDto,
  ): Promise<Address> {
    const existingAddress = await this.userAddressesRepo.findOneBy({
      id: addressId,
      userId,
      isDeleted: false,
    });
    if (!existingAddress) {
      throw new NotFoundException('Address does not exist.');
    }
    Object.assign(existingAddress, userAddressesUpdateDto);
    return await this.userAddressesRepo.save(existingAddress);
  }

  async softDeleteUserAddresses(
    userId: string,
    userAddressIds: string[],
  ): Promise<number> {
    const deleteResult = await this.userAddressesRepo.update(
      { userId: userId, id: In(userAddressIds), isDeleted: false },
      { isDeleted: true },
    );
    return deleteResult.affected ?? 0;
  }
}
