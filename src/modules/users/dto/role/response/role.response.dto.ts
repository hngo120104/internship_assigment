import { Expose } from 'class-transformer';

export class RoleResponseDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;
}
