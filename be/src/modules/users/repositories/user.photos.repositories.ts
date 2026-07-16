import { Repository } from 'typeorm';
import { Photo } from '../entities/photo.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserPhotosRepository extends Repository<Photo> {
  constructor(
    @InjectRepository(Photo) private userPhotosRepo: Repository<Photo>,
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
  ): Promise<Photo[]> {
    const userPhotos = userPhotossInsertRequestDto.map((userPhotos) => ({
      url: userPhotos.url,
      type: userPhotos.type,
      userId: userId,
    }));

    return await this.userPhotosRepo.save(userPhotos);
  }
}
