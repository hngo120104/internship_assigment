import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Public } from '../../auth/public.decorator';
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
      excludeExtraneousValues: true,
    });
  }
}
