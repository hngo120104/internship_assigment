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
import { Role } from './entities/role.entity';
import { RolesRepository } from './repositories/role.repository';
import { Address } from './entities/user.address.entity';
import { ShopPhoto } from './entities/shop.photos.entity';
import { UserRoles } from './entities/user.roles.entity';
import { UserRolesRepository } from './repositories/user.roles.repository';
import { UserRolesServce } from './services/user.roles.service';
import { RolesService } from './services/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Shop,
      Address,
      UserPhoto,
      ShopPhoto,
      Role,
      UserRoles,
    ]),
  ],
  providers: [
    UsersService,
    UserPhotosService,
    UserShopService,
    UsersRepository,
    UserPhotosRepository,
    UserShopRepository,
    RolesRepository,
    UserRolesServce,
    UserRolesRepository,
    RolesService,
    RolesRepository,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    UserShopService,
    UserShopRepository,
    UsersRepository,
    RolesService,
  ],
})
export class UsersModule {}
