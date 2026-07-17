import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UserResponseDto } from '../dto/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserPhotosService } from './user.photos.services';
import { UserPhotosInsertResponseDto } from '../dto/user.photos.insert.response.dto';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserPhotos } from '../entities/photo.entities';
import { DataSource } from 'typeorm';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly userPhotosService: UserPhotosService,
    private readonly jwtService: JwtService,
  ) {}

  @Transactional()
  async createUserWithPhotos(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<User> {
    const existEmail = await this.userRepository.findByEmail(
      userCreateRequestDto.email,
    );

    if (existEmail) {
      throw new ConflictException('Email already exists.');
    }
    const newUser = await this.userRepository.createUser(userCreateRequestDto);
    const userPhotosRequest = userCreateRequestDto.photos;

    let userPhotos: UserPhotos[] = [];

    if (userPhotosRequest && userPhotosRequest.length > 0) {
      userPhotos = await this.userPhotosService.insertPhotosToUser(
        newUser.id,
        userPhotosRequest,
      );
    }
    newUser.photos = userPhotos;

    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findMany(pagination: number): Promise<User[] | []> {
    return await this.userRepository.findMany(pagination);
  }
}
