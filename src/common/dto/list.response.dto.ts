import { Expose } from 'class-transformer';

export class ListResponseDto<T> {
  @Expose()
  data: T[];

  constructor(data: T[]) {
    this.data = data;
  }
}
