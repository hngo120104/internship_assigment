import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/user-photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotoInsertRequestDto } from '../dto/user-photos/request/user-photo-insert.request.dto';

@Injectable()
export class UserPhotosRepository {
  constructor(
    @InjectRepository(UserPhoto)
    private readonly userPhotosRepository: Repository<UserPhoto>,
  ) {}

  async insertPhotosIntoUser(
    userId: string,
    userPhotosInsertDto: UserPhotoInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const userPhotos = userPhotosInsertDto.map((userPhoto) => ({
      url: userPhoto.url,
      type: userPhoto.type,
      userId,
      user: { id: userId },
    }));

    return await this.userPhotosRepository.save(userPhotos);
  }
}
