import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RoleResponseDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;
}
