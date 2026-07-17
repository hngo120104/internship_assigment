import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Shop } from '../users/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { UserPhoto } from '../users/entities/photo.entities';
import { UsersService } from '../users/services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Shop, UserPhoto])],
  controllers: [ProductsController],
  providers: [ProductsService,],
  exports: [ProductsService],
})
export class ProductsModule {}
