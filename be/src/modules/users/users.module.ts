import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [DatabaseService],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})

export class UsersModule {}
