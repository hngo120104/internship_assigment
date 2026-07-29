import { Controller, Get } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Public } from '../../auth/public.decorator';

import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/users/user.response.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Public()
  async findMany(): Promise<UserResponseDto[]> {
    const foundUsers = await this.usersService.findManyActiveUsers(1, 30);
    return foundUsers;
  }
}
