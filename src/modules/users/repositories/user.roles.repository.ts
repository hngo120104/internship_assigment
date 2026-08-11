import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from '../entities/user.roles.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserRolesRepository {
  constructor(
    @InjectRepository(UserRoles)
    private readonly userRolesRepo: Repository<UserRoles>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<UserRoles>,
  ): Promise<UserRoles | null> {
    return await this.userRolesRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<UserRoles>,
  ): Promise<UserRoles[]> {
    return await this.userRolesRepo.find(options);
  }

  async saveUserRoles(user: User, role: Role): Promise<UserRoles> {
    const createdUserRoles = this.userRolesRepo.create({
      userId: user.id,
      roleId: role.id,
      user: user,
      role: role,
    });
    return await this.userRolesRepo.save(createdUserRoles);
  }

  async deleteUserRole(userId: string, roleId: string): Promise<boolean> {
    const deletedResult = await this.userRolesRepo.update(
      { userId: userId, roleId: roleId },
      { isDeleted: true },
    );

    return deletedResult.affected !== 0;
  }
}
