import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

import { NotFoundException } from '@nestjs/common';
import { ConflictException, Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UserPhoto } from '../entities/user.photo.entity';
import { UsersRepository } from '../repositories/users.repository';
import { UserShopService } from './user.shop.service';
import { UserPhotosService } from './user.photos.service';
import { UserCreateRequestDto } from '../dto/users/user.create.request.dto';
import { UserShopCreateRequestDto } from '../dto/user.shop/user.shop.create.request.dto';
import { UserPhotosInsertRequestDto } from '../dto/user.photos/user.photos.insert.request.dto';
import { RolesRepository } from '../repositories/role.repository';
import { UserShopCreateResponseDto } from '../dto/user.shop/user.shop.create.response.dto';
import { UserShopResponseDto } from '../dto/user.shop/user.shop.response.dto';
import { UserResponseDto } from '../dto/users/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserCreateResponseDto } from '../dto/users/user.create.response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly roleRepo: RolesRepository,
    private readonly userPhotosService: UserPhotosService,
    private readonly userShopService: UserShopService,
  ) {}

  async findManyActiveUsers(page: number, limit: number): Promise<UserResponseDto[]> {
    const foundUsers = await this.usersRepo.findManyActiveUsers(page, limit);
    return this.toUserArrayResponseDto(foundUsers);
  }

  async findActiveUserByEmail(email: string): Promise<User> {
    const foundUser = await this.usersRepo.findActiveUserByEmail(email);
    if (!foundUser) {
      throw new NotFoundException('User not found.');
    }
    return foundUser;
  }

  private async validateUserRegistration(
    userCreateRequestDto: UserCreateRequestDto,
  ) {
    const existUserWithEmail = await this.usersRepo.findActiveUserByEmail(
      userCreateRequestDto.email,
    );

    if (existUserWithEmail) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async createUserWithPasswordHashed(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<User> {
    const passwordHashed = await bcrypt.hash(userCreateRequestDto.password, 12);
    const defaultRole = await this.roleRepo.findByRoleName('CUSTOMER');
    const newUserWithPasswordHashed = await this.usersRepo.createUser(
      userCreateRequestDto,
      defaultRole,
      passwordHashed,
    );

    return newUserWithPasswordHashed;
  }

  private async insertPhotosIntoUser(
    createdUser: User,
    userPhotosRequest: UserPhotosInsertRequestDto[],
  ) {
    let userPhotos: UserPhoto[] = [];

    userPhotos = await this.userPhotosService.insertPhotosToUser(
      createdUser.id,
      userPhotosRequest,
    );

    createdUser.photos = userPhotos;
  }

  @Transactional()
  async createDefaultUser(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<UserResponseDto> {
    await this.validateUserRegistration(userCreateRequestDto);

    const newUserWithPasswordHashed =
      await this.createUserWithPasswordHashed(userCreateRequestDto);

    if (userCreateRequestDto.photos && userCreateRequestDto.photos.length > 0) {
      const userPhotosInsertRequest = userCreateRequestDto.photos;
      await this.insertPhotosIntoUser(
        newUserWithPasswordHashed,
        userPhotosInsertRequest,
      );
    }

    return this.toUserResponseDto(newUserWithPasswordHashed);
  }

  async updateUser(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersRepo.updateUser(userId, updateData);
    return this.toUserResponseDto(updatedUser);
  }

  @Transactional()
  async shopRegister(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<UserShopCreateResponseDto> {
    const userShopRegisterResponse = await this.userShopService.createShop(
      userId,
      userShopCreateRequestDto,
    );

    return userShopRegisterResponse;
  }

  toUserCreateResponseDto(user: User): UserCreateResponseDto {
    return plainToInstance(UserCreateResponseDto, user, {
      excludeExtraneousValues: true
    })
  }

  toUserResponseDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  toUserArrayResponseDto(users: User[]): UserResponseDto[] {
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }
}
