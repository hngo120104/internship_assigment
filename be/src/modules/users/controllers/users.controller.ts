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
import { UserCreateRequestDto } from '../dto/user-create-request.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { Public } from '../../auth/public.decorator';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() UserCreateRequestDto: UserCreateRequestDto): Promise<UserResponseDto> {
    return await this.usersService.createUser(UserCreateRequestDto);
  }

  // @Get()
  // @Public()
  // async findMany() {
  //   return await this.usersService.findMany(20);
  // }

  // @Public()
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.usersService.findById(+id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() UserUpdateDto: UserUpdateDto) {
  //   return await this.usersService.update(+id, UserUpdateDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.usersService.delete(+id);
  // }
}
