import { InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entities/user.address.entity';
import { In, Repository } from 'typeorm';
import { UserAddressCreateRequestDto } from '../dto/user.addresses/request/user.address.create.request.dto';
import { UserAddressUpdateRequestDto } from '../dto/user.addresses/request/user.address.update.request.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserAddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly userAddressesRepo: Repository<Address>,
  ) {}

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
    userAddressesCreateDto: UserAddressCreateRequestDto,
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
    userAddressesUpdateDto: UserAddressUpdateRequestDto,
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
