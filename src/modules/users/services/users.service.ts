import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConflictException, Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UserPhoto } from '../entities/user.photo.entity';
import { UsersRepository } from '../repositories/users.repository';
import { UserShopService } from './user.shop.service';
import { UserPhotosService } from './user.photos.service';
import { UserCreateRequestDto } from '../dto/users/request/user.create.request.dto';
import { UserShopCreateRequestDto } from '../dto/user.shop/request/user.shop.create.request.dto';
import { UserPhotoInsertRequestDto } from '../dto/user.photos/request/user.photos.insert.request.dto';
import { RolesRepository } from '../repositories/role.repository';
import { UserShopResponseDto } from '../dto/user.shop/response/user.shop.response.dto';

import { UserResponseDto } from '../dto/users/response/user.response.dto';
import { UserCreateResponseDto } from '../dto/users/response/user.create.response.dto';
import { UserRolesRepository } from '../repositories/user.roles.repository';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import { UserDeleteResponseDto } from '../dto/users/response/user.delete.response.dto';

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
    return toListResponseDtos(UserResponseDto, foundUsers);
  }

  async findActiveUserByUserIdOrThrow(
    userId: string,
  ): Promise<UserResponseDto> {
    const foundUser = await this.usersRepo.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException('User not found.');
    }
    return toResponseDto(UserResponseDto, foundUser);
  }

  async findActiveUserByEmailOrThrow(email: string): Promise<User> {
    const foundUserWithEmail =
      await this.usersRepo.findActiveUserByEmail(email);
    if (!foundUserWithEmail) {
      throw new NotFoundException(`User with email ${email} does not exist.`);
    }
    return foundUserWithEmail;
  }

  private async validateUserRegistration(userCreateDto: UserCreateRequestDto) {
    const existingUserWithEmail = await this.usersRepo.findActiveUserByEmail(
      userCreateDto.email,
    );

    if (existingUserWithEmail) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async createUserWithPasswordHashed(
    userCreateDto: UserCreateRequestDto,
  ): Promise<User> {
    const passwordHashed = await bcrypt.hash(userCreateDto.password, 12);

    const newUserWithPasswordHashed = await this.usersRepo.createUser(
      userCreateDto,
      passwordHashed,
    );
    return newUserWithPasswordHashed;
  }

  private async insertPhotosIntoUser(
    createdUser: User,
    userPhotosDto: UserPhotoInsertRequestDto[],
  ) {
    let userPhotos: UserPhoto[] = [];

    userPhotos = await this.userPhotosService.insertPhotosToUser(
      createdUser.id,
      userPhotosDto,
    );

    createdUser.photos = userPhotos;
  }

  async processCreateUser(userCreateDto: UserCreateRequestDto): Promise<User> {
    const newUserWithPasswordHashed =
      await this.createUserWithPasswordHashed(userCreateDto);
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
    userCreateDto: UserCreateRequestDto,
  ): Promise<UserCreateResponseDto> {
    await this.validateUserRegistration(userCreateDto);

    const newUserWithPasswordHashed =
      await this.processCreateUser(userCreateDto);

    if (userCreateDto.photos && userCreateDto.photos.length > 0) {
      const userPhotosInsertDto = userCreateDto.photos;
      await this.insertPhotosIntoUser(
        newUserWithPasswordHashed,
        userPhotosInsertDto,
      );
    }

    return toResponseDto(UserCreateResponseDto, newUserWithPasswordHashed);
  }

  async updateUser(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersRepo.updateUser(userId, updateData);
    return toResponseDto(UserResponseDto, updatedUser);
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepo.findActiveUserById(userId);

    if (!user) throw new NotFoundException('User does not exist.');
    const userOldPassword = user.passwordHashed;

    const matchedOldPassword = await bcrypt.compare(
      oldPassword,
      userOldPassword,
    );
    if (!matchedOldPassword)
      throw new BadRequestException('Password does not match.');

    const newPasswordHashed = await bcrypt.hash(newPassword, 12);
    const updatedUser = await this.usersRepo.updateUserPassword(
      user,
      newPasswordHashed,
    );
    return toResponseDto(UserResponseDto, updatedUser);
  }

  @Transactional()
  async shopRegister(
    userId: string,
    userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<UserShopResponseDto> {
    const userShopRegisterResponse = await this.userShopService.createShop(
      userId,
      userShopCreateDto,
    );

    return userShopRegisterResponse;
  }

  async banUser(userId: string): Promise<UserResponseDto> {
    const bannedUser = await this.usersRepo.banUser(userId);
    return toResponseDto(UserResponseDto, bannedUser);
  }

  async deleteUserByUserIdOrThrow(
    userId: string,
  ): Promise<UserDeleteResponseDto> {
    const deleteResult = await this.usersRepo.softDeleteUser(userId);
    if (!deleteResult) {
      throw new NotFoundException('User not found.');
    }
    return {
      amount: deleteResult ? 1 : 0,
      message: 'Success.',
    };
  }
}
