import { EntityManager, Repository } from 'typeorm';
import { UserPhotos } from '../entities/photo.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserPhotosRepository extends Repository<UserPhotos> {
  constructor(
    @InjectRepository(UserPhotos) private userPhotosRepo: Repository<UserPhotos>,
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
  ): Promise<UserPhotos[]> {
    const userPhotos = userPhotossInsertRequestDto.map((userPhotos) => ({
      url: userPhotos.url,
      type: userPhotos.type,
      userId: userId,
    }));

    return await this.userPhotosRepo.save(userPhotos);
  }
}
