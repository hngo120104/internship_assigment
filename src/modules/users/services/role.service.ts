import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../repositories/role.repository';
import { RoleCreateDto } from '../dto/role/role.create.dto';
import { RoleResponseDto } from '../dto/role/role.response.dto';
import { toResponseDto } from '../../../utils/to.dto.response';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepo: RolesRepository) {}

  async createRole(roleCreateDto: RoleCreateDto): Promise<RoleResponseDto> {
    const createdRole = await this.rolesRepo.createRole(roleCreateDto);
    return toResponseDto(RoleResponseDto, createdRole);
  }
}
