import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.request.dto';
import { Expose, Type } from 'class-transformer';

export enum ProductSearchSort {
  RELEVANCY = 'RELEVANCY',
  NEWEST = 'NEWEST',
  PRICEASC = 'PRICEASC',
  PRICEDESC = 'PRICEDESC',
}

export class ProductsSearchRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  keyword?: string;

  @IsOptional()
  @IsUUID('all', { each: true })
  @IsArray()
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
