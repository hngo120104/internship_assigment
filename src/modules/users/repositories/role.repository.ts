import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  findByRoleName(roleName: string): Promise<Role> {
    return this.roleRepo.findOneOrFail({
      where: { name: roleName },
    });
  }
}
