import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

import { BadRequestException, NotFoundException } from '@nestjs/common';
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

import { UserResponseDto } from '../dto/users/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserCreateResponseDto } from '../dto/users/user.create.response.dto';
import { UserRolesRepository } from '../repositories/user.roles.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly roleRepo: RolesRepository,
    private readonly userRolesRepo: UserRolesRepository,
    private readonly userPhotosService: UserPhotosService,
    private readonly userShopService: UserShopService,
  ) {}

  async findManyActiveUsers(
    page: number,
    limit: number,
  ): Promise<UserResponseDto[]> {
    const foundUsers = await this.usersRepo.findManyActiveUsers(page, limit);
    return this.toUserArrayResponseDto(foundUsers);
  }

  async findActiveUserByEmail(email: string): Promise<User> {
    const foundUserWithEmail =
      await this.usersRepo.findActiveUserByEmail(email);
    if (!foundUserWithEmail) {
      throw new NotFoundException('User with email not found.');
    }
    return foundUserWithEmail;
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

    const newUserWithPasswordHashed = await this.usersRepo.createUser(
      userCreateRequestDto,
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

  async proccessCreateUser(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<User> {
    const newUserWithPasswordHashed =
      await this.createUserWithPasswordHashed(userCreateRequestDto);
    const defaultRole = await this.roleRepo.findByRoleName('CUSTOMER');
    const savedUserRoles = await this.userRolesRepo.saveUserRoles(
      newUserWithPasswordHashed,
      defaultRole,
    );
    newUserWithPasswordHashed.userRoles = savedUserRoles
      ? [savedUserRoles]
      : [];
    return newUserWithPasswordHashed;
  }

  @Transactional()
  async createDefaultUser(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<UserCreateResponseDto> {
    await this.validateUserRegistration(userCreateRequestDto);

    const newUserWithPasswordHashed =
      await this.proccessCreateUser(userCreateRequestDto);

    if (userCreateRequestDto.photos && userCreateRequestDto.photos.length > 0) {
      const userPhotosInsertRequest = userCreateRequestDto.photos;
      await this.insertPhotosIntoUser(
        newUserWithPasswordHashed,
        userPhotosInsertRequest,
      );
    }

    return this.toUserCreateResponseDto(newUserWithPasswordHashed);
  }

  async updateUser(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersRepo.updateUser(userId, updateData);
    return this.toUserResponseDto(updatedUser);
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
    oldPassword: string,
  ) {
    const user = await this.usersRepo.findActiveUserById(userId);

    if (!user) throw new NotFoundException('User does not exist.');
    const userOldPassowrd = user.passwordHashed;

    const matchedOldPassword = await bcrypt.compare(
      oldPassword,
      userOldPassowrd,
    );
    if (!matchedOldPassword)
      throw new BadRequestException('Password does not match.');

    const newPassowrdHashed = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.updateUserPassword(user, newPassowrdHashed);
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

  async banUser(userId: string): Promise<UserResponseDto> {
    const bannedUser = await this.usersRepo.banUser(userId);
    return this.toUserResponseDto(bannedUser);
  }

  toUserCreateResponseDto(user: User): UserCreateResponseDto {
    return plainToInstance(UserCreateResponseDto, user, {
      excludeExtraneousValues: true,
    });
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
