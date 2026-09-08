import { Expose } from 'class-transformer';

export class DeleteCountResponseDto {
  @Expose()
  message: string = 'Success.';

  @Expose({ name: 'deleted_count' })
  deletedCount!: number;

  constructor(deletedCount?: number) {
    if (deletedCount !== undefined) {
      this.deletedCount = deletedCount;
    }
  }
}
