import { Body, Controller, Delete, Get, Post } from '@nestjs/common';

import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/users/response/user.response.dto';
import { UserPasswordUpdateRequestDto } from '../dto/users/request/user.password.update.request.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { UserDeleteResponseDto } from '../dto/users/response/user.delete.response.dto';

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
    @Body() userPasswordUpdateDto: UserPasswordUpdateRequestDto,
  ): Promise<UserResponseDto> {
    const userId = user.sub;
    return await this.usersService.updateUserPassword(
      userId,
      userPasswordUpdateDto.newPassword,
      userPasswordUpdateDto.oldPassword,
    );
  }

  @Delete()
  async deleteAccount(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserDeleteResponseDto> {
    return await this.usersService.deleteUserByUserIdOrThrow(user.sub);
  }
}
