import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseService } from './modules/database/database.service';
import { DatabaseModule } from './modules/database/database.module';
import { CartsModule } from './modules/carts/carts.module';
import { ProductsModule } from './modules/products/products.module';
import { RolesGuard } from './modules/auth/guards/role/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/guards/auth/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

@Module({
  imports: [
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
          synchronize: true,
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
    OrdersModule,
    UsersModule,
    AuthModule,
    CartsModule,
    ProductsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  constructor(dataSource: DataSource) {}
}
