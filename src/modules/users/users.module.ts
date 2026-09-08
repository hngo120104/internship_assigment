import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Shop } from './entities/shop.entity';
import { UserPhoto } from './entities/user-photo.entity';
import { UsersRepository } from './repositories/users.repository';
import { UserPhotosService } from './services/user-photos.service';
import { UserPhotosRepository } from './repositories/user-photos.repository';
import { ShopsService } from './services/shops.service';
import { ShopsRepository } from './repositories/shops.repository';
import { Role } from './entities/role.entity';
import { RolesRepository } from './repositories/roles.repository';
import { UserAddress } from './entities/user-address.entity';
import { UserRole } from './entities/user-role.entity';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { ShopsController } from './controllers/shops.controller';
import { UserAddressesController } from './controllers/user-addresses.controller';
import { UserAddressesService } from './services/user-addresses.service';
import { UserAddressesRepository } from './repositories/user-addresses.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Shop,
      UserAddress,
      UserPhoto,
      Role,
      UserRole,
    ]),
  ],
  providers: [
    UsersService,
    UserPhotosService,
    ShopsService,
    UsersRepository,
    UserPhotosRepository,
    ShopsRepository,
    RolesRepository,
    UserRolesRepository,
    UserAddressesService,
    UserAddressesRepository,
  ],
  controllers: [UsersController, ShopsController, UserAddressesController],
  exports: [
    UsersService,
    ShopsService,
    ShopsRepository,
    UsersRepository,
    UserAddressesService,
  ],
})
export class UsersModule {}
