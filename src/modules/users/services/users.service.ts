import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConflictException, Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UserPhoto } from '../entities/user.photo.entity';
import { UsersRepository } from '../repositories/users.repository';
import { UserShopService } from './user.shop.service';
import { UserPhotosService } from './user.photos.service';
import { UserCreateDto } from '../dto/users/user.create.dto';
import { UserShopCreateDto } from '../dto/user.shop/user.shop.create.dto';
import { UserPhotosInsertDto } from '../dto/user.photos/user.photos.insert.dto';
import { RolesRepository } from '../repositories/role.repository';
import { UserShopResponseDto } from '../dto/user.shop/user.shop.response.dto';

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

  async findActiveUserByUserId(userId: string): Promise<UserResponseDto> {
    const foundUser = await this.usersRepo.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException('User not found.');
    }
    return this.toUserResponseDto(foundUser);
  }

  async findActiveUserByEmail(email: string): Promise<User> {
    const foundUserWithEmail =
      await this.usersRepo.findActiveUserByEmail(email);
    if (!foundUserWithEmail) {
      throw new NotFoundException(`User with email ${email}.`);
    }
    return foundUserWithEmail;
  }

  private async validateUserRegistration(userCreateDto: UserCreateDto) {
    const existUserWithEmail = await this.usersRepo.findActiveUserByEmail(
      userCreateDto.email,
    );

    if (existUserWithEmail) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async createUserWithPasswordHashed(
    userCreateDto: UserCreateDto,
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
    userPhotosDto: UserPhotosInsertDto[],
  ) {
    let userPhotos: UserPhoto[] = [];

    userPhotos = await this.userPhotosService.insertPhotosToUser(
      createdUser.id,
      userPhotosDto,
    );

    createdUser.photos = userPhotos;
  }

  async processCreateUser(userCreateDto: UserCreateDto): Promise<User> {
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
    userCreateDto: UserCreateDto,
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
  ): Promise<UserResponseDto> {
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
    const updatedUser = await this.usersRepo.updateUserPassword(
      user,
      newPassowrdHashed,
    );
    return this.toUserResponseDto(updatedUser);
  }

  @Transactional()
  async shopRegister(
    userId: string,
    userShopCreateDto: UserShopCreateDto,
  ): Promise<UserShopResponseDto> {
    const userShopRegisterResponse = await this.userShopService.createShop(
      userId,
      userShopCreateDto,
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
