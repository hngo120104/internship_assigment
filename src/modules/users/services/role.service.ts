import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../repositories/role.repository';
import { RoleCreateDto } from '../dto/role/role.create.dto';
import { Role } from '../entities/role.entity';
import { RoleResponseDto } from '../dto/role/role.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepo: RolesRepository) {}

  async createRole(roleCreateDto: RoleCreateDto): Promise<RoleResponseDto> {
    const createdRole = await this.rolesRepo.createRole(roleCreateDto);
    return this.toResponse(createdRole);
  }

  private toResponse(role: Role): RoleResponseDto {
    return plainToInstance(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }
}
