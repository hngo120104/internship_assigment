import { In, Repository } from 'typeorm';
import { UserPhoto } from '../entities/user.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertDto } from '../dto/user.photos/user.photos.insert.dto';

@Injectable()
export class UserPhotosRepository {
  constructor(
    @InjectRepository(UserPhoto)
    private readonly userPhotosRepo: Repository<UserPhoto>,
  ) {}

  async insertPhotosIntoUser(
    userId: string,
    userPhotosInsertDto: UserPhotosInsertDto[],
  ): Promise<UserPhoto[]> {
    const userPhotos = userPhotosInsertDto.map((userPhoto) => ({
      url: userPhoto.url,
      type: userPhoto.type,
      userId,
      user: { id: userId },
    }));

    return await this.userPhotosRepo.save(userPhotos);
  }

  async softDeleteUserPhotos(
    userId: string,
    userPhotoIds: string[],
  ): Promise<number> {
    const result = await this.userPhotosRepo.update(
      { userId: userId, id: In(userPhotoIds), isDeleted: false },
      { isDeleted: true },
    );
    return result.affected ?? 0;
  }
}
