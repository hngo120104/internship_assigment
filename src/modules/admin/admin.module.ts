import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../category/categories.module';

@Module({
  imports: [UsersModule, CategoriesModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [],
})
export class AdminModules {}
