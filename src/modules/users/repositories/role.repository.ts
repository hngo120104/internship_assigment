import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleCreateDto } from '../dto/role/role.create.dto';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<Role>,
  ): Promise<Role | null> {
    return await this.roleRepo.findOne(options);
  }

  async findManyWithOptions(options: FindManyOptions<Role>): Promise<Role[]> {
    return await this.roleRepo.find(options);
  }

  async createRole(roleCreateDto: RoleCreateDto): Promise<Role> {
    const newRole = this.roleRepo.create({
      name: roleCreateDto.name,
      description: roleCreateDto.description,
    });
    return await this.roleRepo.save(newRole);
  }

  findByRoleName(roleName: string): Promise<Role> {
    return this.roleRepo.findOneOrFail({
      where: { name: roleName },
    });
  }
}
