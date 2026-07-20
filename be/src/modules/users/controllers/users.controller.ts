import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { Public } from '../../auth/public.decorator';
import { HttpStatus, HttpCode } from '@nestjs/common';
import { UserResponseDto } from '../dto/user.response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Public()
  async findMany(): Promise<UserResponseDto[]> {
    const foundUsers = await this.usersService.findMany(20);
    return plainToInstance(UserResponseDto, foundUsers, {
      excludeExtraneousValues: true
    })
  }

  @Public()
  @Delete(':id')
  async deleteUserById(@Param('id') deleteUserId: number) {
    return await this.usersService.deleteUserById(deleteUserId);
  }
}
