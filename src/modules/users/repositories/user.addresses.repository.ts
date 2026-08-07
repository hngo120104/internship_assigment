import { InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entities/user.address.entity';
import { In, Repository } from 'typeorm';
import { UserAddressesCreateDto } from '../dto/user.addresses/user.addresses.create.dto';
import { UserAddressesUpdateDto } from '../dto/user.addresses/user.addresses.update.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class UserAddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly userAddressesRepo: Repository<Address>,
  ) {}

  async createAddress(
    userId: string,
    userAddressesCreateDto: UserAddressesCreateDto,
  ): Promise<Address> {
    const newUserAddress = this.userAddressesRepo.create({
      id: randomUUID(),
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
