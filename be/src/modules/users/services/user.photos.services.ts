import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';
import { UserPhotosInsertResponseDto } from '../dto/user.photos.insert.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserPhotosRepository } from '../repositories/user.photos.repositories';
import { UserPhotos } from '../entities/photo.entities';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {
  }

  async insertPhotosToUser(userId: number,
    userPhotosInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhotos[]> {
    return await this.userPhotosRepository.insertPhotosIntoUser(userId, userPhotosInsertRequestDto);
  }
}
