import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import { Address } from '../../modules/users/entities/user.address.entity';
import { Shop } from '../../modules/users/entities/shop.entity';
import { UserPhoto } from '../../modules/users/entities/user.photo.entity';
import { ShopPhoto } from '../../modules/users/entities/shop.photos.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { Category } from '../../modules/category/entities/category.entity';
import { CartItem } from '../../modules/carts/entities/cart.item.entity';
import { ProductPhoto } from '../../modules/products/entities/product.photo.entity';
import { SeederService } from './services/seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Address,
      Shop,
      UserPhoto,
      ShopPhoto,
      Product,
      Category,
      CartItem,
      ProductPhoto,
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory() {
        return {
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3307,
          username: process.env.DB_USERNAME || 'hoangngo',
          password: process.env.DB_PASSWORD || '123456',
          database: process.env.DB_NAME || 'internship_assignment',
          autoLoadEntities: true,
          synchronize: false,
          migrations: ['dist/migrations/*.js'],
          migrationsRun: true,
          logging: false,
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
  ],
  providers: [SeederService],
  exports: [],
})
export class SeederModule {}
