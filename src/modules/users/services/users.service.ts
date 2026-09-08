import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConflictException, Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UserPhoto } from '../entities/user-photo.entity';
import { UsersRepository } from '../repositories/users.repository';
import { UserPhotosService } from './user-photos.service';
import { UserCreateRequestDto } from '../dto/users/request/user-create.request.dto';
import { UserPhotoInsertRequestDto } from '../dto/user-photos/request/user-photo-insert.request.dto';
import { RolesRepository } from '../repositories/roles.repository';

import { UserResponseDto } from '../dto/users/response/user.response.dto';
import { UserRolesRepository } from '../repositories/user-roles.repository';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/response-dto.mapper';
import { DeleteCountResponseDto } from '../../../common/dto/delete-count.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly userPhotosService: UserPhotosService,
  ) {}

  async findAllActiveUsers(
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<UserResponseDto>> {
    const [foundUsers, count] = await this.usersRepository.findAllActiveUsers(
      paginationRequest.page,
      paginationRequest.size,
    );
    const response = toListResponseDtos(UserResponseDto, foundUsers);
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async findActiveUserByUserIdOrThrow(
    userId: string,
  ): Promise<UserResponseDto> {
    const foundUser = await this.usersRepository.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException('User not found.');
    }
    return toResponseDto(UserResponseDto, foundUser);
  }

  async findActiveUserByEmailOrThrow(email: string): Promise<User> {
    const foundUserWithEmail =
      await this.usersRepository.findActiveUserByEmail(email);
    if (!foundUserWithEmail) {
      throw new NotFoundException(`User with email ${email} does not exist.`);
    }
    return foundUserWithEmail;
  }

  private async validateUserRegistration(userCreateDto: UserCreateRequestDto) {
    const existingUserWithEmail =
      await this.usersRepository.findActiveUserByEmail(userCreateDto.email);

    if (existingUserWithEmail) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async createUserWithPasswordHashed(
    userCreateDto: UserCreateRequestDto,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(userCreateDto.password, 12);

    const newUserWithPasswordHashed = await this.usersRepository.createUser(
      userCreateDto,
      hashedPassword,
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
    const defaultRole = await this.rolesRepository.findByRoleName('CUSTOMER');
    const savedUserRole = await this.userRolesRepository.saveUserRole(
      newUserWithPasswordHashed,
      defaultRole,
    );
    newUserWithPasswordHashed.userRoles = savedUserRole ? [savedUserRole] : [];
    return newUserWithPasswordHashed;
  }

  @Transactional()
  async createDefaultUser(userCreateDto: UserCreateRequestDto): Promise<User> {
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

    return newUserWithPasswordHashed;
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findActiveUserById(userId);

    if (!user) throw new NotFoundException('User does not exist.');
    const userOldPassword = user.passwordHashed;

    const matchedOldPassword = await bcrypt.compare(
      oldPassword,
      userOldPassword,
    );
    if (!matchedOldPassword)
      throw new BadRequestException('Password does not match.');

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedUser = await this.usersRepository.updateUserPassword(
      user,
      newHashedPassword,
    );
    return toResponseDto(UserResponseDto, updatedUser);
  }

  async banUser(userId: string): Promise<UserResponseDto> {
    const bannedUser = await this.usersRepository.banUser(userId);
    return toResponseDto(UserResponseDto, bannedUser);
  }

  async deleteUserByUserIdOrThrow(
    userId: string,
  ): Promise<DeleteCountResponseDto> {
    const deleteResult = await this.usersRepository.softDeleteUser(userId);
    if (!deleteResult) {
      throw new NotFoundException('User not found.');
    }
    return new DeleteCountResponseDto(1);
  }
}
