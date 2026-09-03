import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.request.dto';

export enum ProductSearchSort {
  RELAVANCE = 'RELEVANCE',
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
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Max(100000000)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductSearchSort)
  sortOrder?: ProductSearchSort;
}
