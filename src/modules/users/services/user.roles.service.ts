import { Injectable } from '@nestjs/common';
import { UserRolesRepository } from '../repositories/user.roles.repository';
import { UserRoles } from '../entities/user.roles.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserRolesServce {
  constructor(private readonly userRolesRepo: UserRolesRepository) {}

  async saveUserRoles(user: User, role: Role): Promise<UserRoles> {
    return await this.userRolesRepo.saveUserRoles(user, role);
  }
}
