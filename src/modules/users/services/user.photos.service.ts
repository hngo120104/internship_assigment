import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPhotosInsertDto } from '../dto/user.photos/user.photos.insert.dto';
import { UserPhotosRepository } from '../repositories/user.photos.repository';
import { UserPhoto } from '../entities/user.photo.entity';
import { UserPhotoResponseDto } from '../dto/user.photos/user.photos.insert.response.dto';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {}

  async findUserPhotoByIdOrThrow(
    photoId: string,
  ): Promise<UserPhotoResponseDto> {
    const foundUserPhoto =
      await this.userPhotosRepository.findUserPhotoById(photoId);
    if (!foundUserPhoto) {
      throw new NotFoundException('User photo not found.');
    }
    return toResponseDto(UserPhotoResponseDto, foundUserPhoto);
  }

  async findUserPhotosByUserId(
    userId: string,
  ): Promise<UserPhotoResponseDto[]> {
    const foundUserPhotos =
      await this.userPhotosRepository.findUserPhotosByUserId(userId);
    if (foundUserPhotos.length === 0) {
      throw new NotFoundException('User has no photo.');
    }
    return toListResponseDtos(UserPhotoResponseDto, foundUserPhotos);
  }

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

  async deleteUserPhotosOrThrow(
    userId: string,
    userPhotoIds: string[],
  ): Promise<UserPhotoResponseDto[]> {
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
    const deletedPhotos = await this.userPhotosRepository.findManyWithOptions({
      where: { isDeleted: true },
    });
    return toListResponseDtos(UserPhotoResponseDto, deletedPhotos);
  }
}
