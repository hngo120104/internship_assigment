import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/photo.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';

@Injectable()
export class UserPhotosRepository {
  constructor(
    @InjectRepository(UserPhoto) private userPhotosRepo: Repository<UserPhoto>,
  ) {}

  async insertPhotosIntoUser(
    userId: number,
    userPhotossInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const userPhotos = userPhotossInsertRequestDto.map((userPhoto) => ({
      url: userPhoto.url,
      type: userPhoto.type,
      userId,
      user: { id: userId },
    }));

    return await this.userPhotosRepo.save(userPhotos);
  }
}
