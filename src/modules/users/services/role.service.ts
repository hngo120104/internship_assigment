import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../repositories/role.repository';
import { RoleCreateRequestDto } from '../dto/role/request/role.create.request.dto';
import { RoleResponseDto } from '../dto/role/response/role.response.dto';
import { toResponseDto } from '../../../utils/to.dto.response';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepo: RolesRepository) {}

  async createRole(roleCreateDto: RoleCreateRequestDto): Promise<RoleResponseDto> {
    const createdRole = await this.rolesRepo.createRole(roleCreateDto);
    return toResponseDto(RoleResponseDto, createdRole);
  }
}
