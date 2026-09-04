import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../services/search.service';
import { Public } from '../../auth/public.decorator';
import { ProductsSearchRequestDto } from '../dto/request/products.search.request';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { ProductsSearchResponseDto } from '../dto/response/products.search.response.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/products')
  @Public()
  async findProductByText(
    @Query() query: ProductsSearchRequestDto,
  ): Promise<ListResponseDto<ProductsSearchResponseDto>> {
    return await this.searchService.findProductsWithOptionalQueryParams(query);
  }
}
