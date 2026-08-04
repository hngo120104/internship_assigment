import { Body, Controller, Get, Post } from '@nestjs/common';

import { Public } from '../../auth/public.decorator';

import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/users/user.response.dto';
import { UserPasswordUpdateRequestDto } from '../dto/users/user.password.update.request.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Public()
  async findMany(): Promise<UserResponseDto[]> {
    const foundUsers = await this.usersService.findManyActiveUsers(1, 30);
    return foundUsers;
  }

  @Post('/update-password')
  async updateUserPassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userPasswordUpdateRequestDto: UserPasswordUpdateRequestDto,
  ) {
    const userId = user.sub;
    await this.usersService.updateUserPassword(
      userId,
      userPasswordUpdateRequestDto.newPassword,
      userPasswordUpdateRequestDto.oldPassword,
    );
  }
}
