import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Shop } from './entities/shop.entity';
import { Photo } from './entities/photo.entities';
import { UsersRepository } from './repositories/users.repository';
import { UserPhotosService } from './services/user.photos.services';
import { UserPhotosRepository } from './repositories/user.photos.repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Shop, Photo])],
  providers: [UsersService, UsersRepository, UserPhotosService, UserPhotosRepository],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository, TypeOrmModule],
})
export class UsersModule {}
