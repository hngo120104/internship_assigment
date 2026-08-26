import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Query,
  Post,
} from '@nestjs/common';

import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/users/response/user.response.dto';
import { UserPasswordUpdateRequestDto } from '../dto/users/request/user.password.update.request.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { DeleteCountResponseDto } from '../../../common/dto/delete.count.response.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getCurrentUserProfile(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserResponseDto> {
    return await this.usersService.findActiveUserByUserIdOrThrow(user.userId);
  }

  @Get('active')
  @Roles(Role.ADMIN)
  async findAllActiveUsers(
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<UserResponseDto>> {
    return await this.usersService.findAllActiveUsers(paginationRequest);
  }

  @Post(':userId/ban')
  @Roles(Role.ADMIN)
  async banUser(@Param('userId') userId: string): Promise<UserResponseDto> {
    return await this.usersService.banUser(userId);
  }

  @Patch('password')
  async updateUserPassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userPasswordUpdateDto: UserPasswordUpdateRequestDto,
  ): Promise<UserResponseDto> {
    const userId = user.userId;
    return await this.usersService.updateUserPassword(
      userId,
      userPasswordUpdateDto.newPassword,
      userPasswordUpdateDto.oldPassword,
    );
  }

  @Delete()
  async deleteAccount(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteCountResponseDto> {
    return await this.usersService.deleteUserByUserIdOrThrow(user.userId);
  }
}
