import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleCreateRequestDto } from '../dto/role/role.create.request.dto';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async createRole(roleCreateRequestDto: RoleCreateRequestDto): Promise<Role> {
    const newRole = this.roleRepo.create({
      name: roleCreateRequestDto.name,
      description: roleCreateRequestDto.description,
    });
    return await this.roleRepo.save(newRole);
  }

  findByRoleName(roleName: string): Promise<Role> {
    return this.roleRepo.findOneOrFail({
      where: { name: roleName },
    });
  }
}
