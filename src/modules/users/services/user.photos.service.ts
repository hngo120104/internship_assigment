import { Injectable } from '@nestjs/common';
import { UserPhotosInsertRequestDto } from '../dto/user.photos.insert.request.dto';
import { UserPhotosRepository } from '../repositories/user.photos.repository';
import { UserPhoto } from '../entities/photo.entity';

@Injectable()
export class UserPhotosService {
  constructor(private readonly userPhotosRepository: UserPhotosRepository) {}

  insertPhotosToUser(
    userId: number,
    userPhotosInsertRequestDto: UserPhotosInsertRequestDto[],
  ): Promise<UserPhoto[]> {
    return this.userPhotosRepository.insertPhotosIntoUser(
      userId,
      userPhotosInsertRequestDto,
    );
  }
}
