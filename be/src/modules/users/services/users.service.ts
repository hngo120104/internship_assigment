import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UserResponseDto } from '../dto/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserPhotosService } from './user.photos.services';
import { UserPhotosInsertResponseDto } from '../dto/user.photos.insert.response.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly userPhotosService: UserPhotosService,
    private readonly jwtService: JwtService
  ) {}

  async 

  async createUser(userCreateRequestDto: UserCreateRequestDto): Promise<UserResponseDto> {
    const newUser = await this.userRepository.createUser(userCreateRequestDto);

    let savedUserPhotos: UserPhotosInsertResponseDto[]= [];

    if (userCreateRequestDto.photos && userCreateRequestDto.photos.length > 0) {
      savedUserPhotos = await this.userPhotosService.insertPhotosToUser(
        newUser.id,
        userCreateRequestDto.photos
      )
    }

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role
    }

    const userResponseDtoWithPhotos = {
      ...newUser,
      userPhotos: savedUserPhotos,
      access_token: this.jwtService.sign(payload)
    }    

    return plainToInstance(UserResponseDto, userResponseDtoWithPhotos, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const foundUser = await this.userRepository.findByEmail(email);
    return plainToInstance(UserResponseDto, foundUser, {
      excludeExtraneousValues:true,
    });
  }

  async findMany(pagination: number): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findMany(pagination);
    return plainToInstance(UserResponseDto, users,
      { excludeExtraneousValues: true }
    )
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return await this.userRepository.checkEmailExist(email);
    
  }
}
