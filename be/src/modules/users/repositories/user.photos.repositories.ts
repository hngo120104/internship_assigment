import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/photo.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';

@Injectable()
export class UserPhotosRepository extends Repository<UserPhoto> {
  constructor(
    @InjectRepository(UserPhoto) private userPhotosRepo: Repository<UserPhoto>,
  ) {
    super(
      userPhotosRepo.target,
      userPhotosRepo.manager,
      userPhotosRepo.queryRunner,
    );
  }

  async insertPhotosIntoUser(
    userId: number,
    userPhotossInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    const userPhotos = userPhotossInsertRequestDto.map((userPhotos) => ({
      url: userPhotos.url,
      type: userPhotos.type,
      userId: userId,
    }));

    return await this.userPhotosRepo.save(userPhotos);
  }
}
