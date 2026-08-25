import { Expose } from 'class-transformer';

export class ListResponseDto<T> {
  @Expose()
  data: T[];

  @Expose()
  page: number;

  @Expose()
  size: number;

  @Expose({ name: 'total_pages' })
  totalPages: number;

  @Expose({ name: 'total_items' })
  totalItems: number;

  constructor(data: T[], count: number, page?: number, size?: number) {
    this.data = data;
    this.page = page ?? 1;
    this.size = size && size > 0 ? size : 10;
    this.totalItems = count;
    this.totalPages = this.size > 0 ? Math.ceil(count / this.size) : 0;
  }
}
