import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/user.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos/user.photos.insert.request.dto';

@Injectable()
export class UserPhotosRepository {
  constructor(
    @InjectRepository(UserPhoto)
    private readonly userPhotosRepo: Repository<UserPhoto>,
  ) {}

  insertPhotosIntoUser(
    userId: string,
    UserPhotosInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const userPhotos = UserPhotosInsertRequestDto.map((userPhoto) => ({
      url: userPhoto.url,
      type: userPhoto.type,
      userId,
      user: { id: userId },
    }));

    return this.userPhotosRepo.save(userPhotos);
  }
}
