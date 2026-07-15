import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user-create-request.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UserResponseDto } from '../dto/user-response.dto';
import { plainToInstance } from 'class-transformer';


@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
  ) {}

  async createUser(userCreateRequestDto: UserCreateRequestDto): Promise<UserResponseDto> {
    const savedUser = await this.userRepository.createUser(userCreateRequestDto);
    return plainToInstance(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const foundUser = await this.userRepository.findByEmail(email);
    return plainToInstance(UserResponseDto, foundUser, {
      excludeExtraneousValues:true,
    });
  }
}
