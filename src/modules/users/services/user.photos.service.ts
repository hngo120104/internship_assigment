import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPhotosInsertDto } from '../dto/user.photos/user.photos.insert.dto';
import { UserPhotosRepository } from '../repositories/user.photos.repository';
import { UserPhoto } from '../entities/user.photo.entity';
import { UserPhotoResponseDto } from '../dto/user.photos/user.photos.insert.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {}

  async insertPhotosToUser(
    userId: string,
    userPhotosInsertDto: UserPhotosInsertDto[],
  ): Promise<UserPhoto[]> {
    const insertedPhotos = await this.userPhotosRepository.insertPhotosIntoUser(
      userId,
      userPhotosInsertDto,
    );

    return insertedPhotos;
  }

  async removeUserPhotos(
    userId: string,
    userPhotoIds: string[],
  ): Promise<void> {
    if (userPhotoIds.length === 0) {
      throw new BadRequestException('Photos must not be empty');
    }
    const deletedAmount = await this.userPhotosRepository.softDeleteUserPhotos(
      userId,
      userPhotoIds,
    );
    if (deletedAmount !== userPhotoIds.length) {
      throw new NotFoundException('Some photos might already be deleted.');
    }
  }

  private toUserPhotoResponseDto(userPhoto: UserPhoto): UserPhotoResponseDto {
    return plainToInstance(UserPhotoResponseDto, userPhoto, {
      excludeExtraneousValues: true,
    });
  }

  private toUserPhotosResponseDto(
    userPhoto: UserPhoto[],
  ): UserPhotoResponseDto[] {
    return plainToInstance(UserPhotoResponseDto, userPhoto, {
      excludeExtraneousValues: true,
    });
  }
}
