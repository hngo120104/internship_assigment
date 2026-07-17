import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { Public } from '../../auth/public.decorator';
import { HttpStatus, HttpCode } from '@nestjs/common';
import { UserResponseDto } from '../dto/user.response.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Public()
  async findMany() {
    return await this.usersService.findMany(20);
  }
}
