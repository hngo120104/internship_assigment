import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';

@Injectable()
export class UserPhotosRepository {
  constructor(
    @InjectRepository(UserPhoto) private userPhotosRepo: Repository<UserPhoto>,
  ) {}

  insertPhotosIntoUser(
    userId: number,
    userPhotosInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const userPhotos = userPhotosInsertRequestDto.map((userPhoto) => ({
      url: userPhoto.url,
      type: userPhoto.type,
      userId,
      user: { id: userId },
    }));

    return this.userPhotosRepo.save(userPhotos);
  }
}
