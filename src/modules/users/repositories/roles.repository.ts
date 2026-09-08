import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  findByRoleName(roleName: string): Promise<Role> {
    return this.rolesRepository.findOneOrFail({
      where: { name: roleName },
    });
  }
}
