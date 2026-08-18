import { Injectable } from '@nestjs/common';
import { UserPhotoInsertRequestDto } from '../dto/user.photos/request/user.photos.insert.request.dto';
import { UserPhotosRepository } from '../repositories/user.photos.repository';
import { UserPhoto } from '../entities/user.photo.entity';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {}

  async insertPhotosToUser(
    userId: string,
    userPhotosInsertDto: UserPhotoInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const insertedPhotos = await this.userPhotosRepository.insertPhotosIntoUser(
      userId,
      userPhotosInsertDto,
    );

    return insertedPhotos;
  }
}
