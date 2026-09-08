import { Expose, Transform, TransformFnParams } from 'class-transformer';

export class RoleResponseDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'role_type' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  roleType!: string;
}
