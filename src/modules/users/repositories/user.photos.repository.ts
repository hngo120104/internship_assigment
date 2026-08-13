import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { UserPhoto } from '../entities/user.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos/request/user.photos.insert.request.dto';

@Injectable()
export class UserPhotosRepository {
  constructor(
    @InjectRepository(UserPhoto)
    private readonly userPhotosRepo: Repository<UserPhoto>,
  ) {}

  async findUserPhotoById(photoId: string): Promise<UserPhoto | null> {
    return await this.userPhotosRepo.findOneBy({ id: photoId });
  }

  async findUserPhotosByUserId(userId: string): Promise<UserPhoto[]> {
    return await this.userPhotosRepo.find({
      where: { userId: userId, isDeleted: false },
    });
  }

  async findOneWithOptions(
    options: FindOneOptions<UserPhoto>,
  ): Promise<UserPhoto | null> {
    return await this.userPhotosRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<UserPhoto>,
  ): Promise<UserPhoto[]> {
    return await this.userPhotosRepo.find(options);
  }

  async insertPhotosIntoUser(
    userId: string,
    userPhotosInsertDto: UserPhotosInsertRequestDto[],
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
