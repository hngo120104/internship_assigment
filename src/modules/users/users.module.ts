import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Shop } from './entities/shop.entity';
import { UserPhoto } from './entities/photo.entity';
import { UsersRepository } from './repositories/users.repository';
import { UserPhotosService } from './services/user.photos.service';
import { UserPhotosRepository } from './repositories/user.photos.repository';
import { UserShopService } from './services/user.shop.service';
import { UserShopRepository } from './repositories/user.shop.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Shop, UserPhoto])],
  providers: [
    UsersService,
    UserPhotosService,
    UserShopService,
    UsersRepository,
    UserPhotosRepository,
    UserShopRepository,
  ],
  controllers: [UsersController],
  exports: [UsersService, UserShopService],
})
export class UsersModule {}
