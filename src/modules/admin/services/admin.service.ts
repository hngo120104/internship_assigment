import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { UserResponseDto } from '../../users/dto/users/response/user.response.dto';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async banUser(userId: string): Promise<UserResponseDto> {
    return await this.usersService.banUser(userId);
  }
}
