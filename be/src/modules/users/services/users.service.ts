import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UserPhotosService } from './user.photos.services';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserPhoto } from '../entities/photo.entities';
import * as bcrypt from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly userPhotosService: UserPhotosService,
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

    const passwordHashed = await bcrypt.hash(userCreateRequestDto.password, 12);
    const newUser = await this.userRepository.createUser(userCreateRequestDto, passwordHashed);
    const userPhotosRequest = userCreateRequestDto.photos;

    let userPhotos: UserPhoto[] = [];

    if (userPhotosRequest && userPhotosRequest.length > 0) {
      userPhotos = await this.userPhotosService.insertPhotosToUser(
        newUser.id,
        userPhotosRequest,
      );
    }
    newUser.photos = userPhotos;

    return newUser;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  findMany(pagination: number): Promise<User[] | []> {
    return this.userRepository.findMany(pagination);
  }

  async deleteUserById(userId: number): Promise<User | null> {
    return await this.userRepository.deleteUserById(userId);
  }
  
}
