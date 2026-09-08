import { Expose, Transform, TransformFnParams } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'icon_url' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  iconUrl?: string;

  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'parent_id' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  parentId?: string;

  @Expose({ name: 'is_active' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  isActive!: boolean;
}
