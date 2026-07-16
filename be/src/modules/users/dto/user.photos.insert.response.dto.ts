import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserPhotosInsertResponseDto {
  @Expose() id!: string;
  @Expose() userId!: string;
}
