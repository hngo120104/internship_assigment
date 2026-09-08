import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ProductSearchSort } from '../../../products/enums/product-search-sort.enum';
import { PaginationQueryDto } from '../../../../common/dto/pagination.request.dto';
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';

export class ProductSearchRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  keyword?: string;

  @IsOptional()
  @IsUUID('all', { each: true })
  @IsArray()
  @ArrayMaxSize(50)
  @Transform(({ value }: TransformFnParams): unknown => {
    const queryValue: unknown = value;
    if (Array.isArray(queryValue)) return queryValue as unknown[];
    if (typeof queryValue === 'string') {
      return queryValue
        .split(',')
        .map((categoryId) => categoryId.trim())
        .filter(Boolean);
    }
    return queryValue;
  })
  categoryIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100000000)
  @Expose({ name: 'min_price' })
  minPrice?: number;

  @IsOptional()
  @Min(0)
  @Max(100000000)
  @Type(() => Number)
  @Expose({ name: 'max_price' })
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductSearchSort)
  @Expose({ name: 'sort_order' })
  sortOrder?: ProductSearchSort;
}
