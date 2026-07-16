import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';
import { UserPhotosInsertResponseDto } from '../dto/user.photos.insert.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserPhotosRepository } from '../repositories/user.photos.repositories';
import { UsersService } from './users.service';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {
  }

  async insertPhotosToUser(userId: number,
    userPhotosInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhotosInsertResponseDto[]> {
    const insertedUserPhotos = await this.userPhotosRepository.insertPhotosIntoUser(userId, userPhotosInsertRequestDto);
    return plainToInstance(UserPhotosInsertResponseDto, insertedUserPhotos, {
        excludeExtraneousValues: true,
    })
  }
}
