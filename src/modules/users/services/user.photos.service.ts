import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos/user.photos.insert.request.dto';
import { UserPhotosRepository } from '../repositories/user.photos.repository';
import { UserPhoto } from '../entities/user.photo.entity';
import { UserPhotoResponseDto } from '../dto/user.photos/user.photos.insert.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {}

  async insertPhotosToUser(
    userId: string,
    UserPhotosInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const insertedPhotos = await this.userPhotosRepository.insertPhotosIntoUser(
      userId,
      UserPhotosInsertRequestDto,
    );

    return insertedPhotos;
  }

  private toUserPhotoResponseDto(userPhoto: UserPhoto): UserPhotoResponseDto {
    return plainToInstance(UserPhotoResponseDto, userPhoto, {
      excludeExtraneousValues: true,
    });
  }

  private toUserPhotosResponseDto(userPhoto: UserPhoto[]): UserPhotoResponseDto[] {
    return plainToInstance(UserPhotoResponseDto, userPhoto, {
      excludeExtraneousValues: true,
    });
  }
}
