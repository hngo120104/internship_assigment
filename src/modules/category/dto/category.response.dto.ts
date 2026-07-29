import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'iconUrl' })
  icon_url?: string;

  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'parentId' })
  parent_id?: string;

  @Expose({ name: 'isActive' })
  is_active!: boolean;
}
