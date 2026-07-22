import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserPhotosInsertResponseDto {
  @Expose() url!: string;
  @Expose() type!: string;
}
