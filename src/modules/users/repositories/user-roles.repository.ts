import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../entities/user-role.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserRolesRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
  ) {}

  async saveUserRole(user: User, role: Role): Promise<UserRole> {
    const createdUserRole = this.userRolesRepository.create({
      userId: user.id,
      roleId: role.id,
      user: user,
      role: role,
    });
    return await this.userRolesRepository.save(createdUserRole);
  }
}
