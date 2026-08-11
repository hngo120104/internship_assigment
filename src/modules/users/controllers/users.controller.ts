import { Body, Controller, Get, Post } from '@nestjs/common';

import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/users/user.response.dto';
import { UserPasswordUpdateDto } from '../dto/users/user.password.update.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getCurrentUserProfile(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserResponseDto> {
    return await this.usersService.findActiveUserEntityByUserIdOrThrow(
      user.sub,
    );
  }

  @Post('/update-password')
  async updateUserPassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userPasswordUpdateDto: UserPasswordUpdateDto,
  ): Promise<UserResponseDto> {
    const userId = user.sub;
    return await this.usersService.updateUserPassword(
      userId,
      userPasswordUpdateDto.newPassword,
      userPasswordUpdateDto.oldPassword,
    );
  }
}
