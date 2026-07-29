import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Shop } from './entities/shop.entity';
import { UserPhoto } from './entities/user.photo.entity';
import { UsersRepository } from './repositories/users.repository';
import { UserPhotosService } from './services/user.photos.service';
import { UserPhotosRepository } from './repositories/user.photos.repository';
import { UserShopService } from './services/user.shop.service';
import { UserShopRepository } from './repositories/user.shop.repository';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart.item.entity';
import { Role } from './entities/role.entity';
import { RolesRepository } from './repositories/role.repository';
import { Address } from './entities/user.address.entity';
import { ShopPhoto } from './entities/shop.photos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Shop, Address, UserPhoto, ShopPhoto, Role]),
  ],
  providers: [
    UsersService,
    UserPhotosService,
    UserShopService,
    UsersRepository,
    UserPhotosRepository,
    UserShopRepository,
    RolesRepository,
  ],
  controllers: [UsersController],
  exports: [UsersService, UserShopService, UserShopRepository, UsersRepository],
})
export class UsersModule {}
