import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../services/search.service';
import { Public } from '../../auth/public.decorator';
import { ProductSearchRequestDto } from '../dto/request/product-search.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { ProductSearchResponseDto } from '../dto/response/product-search.response.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/products')
  @Public()
  async findProductByText(
    @Query() query: ProductSearchRequestDto,
  ): Promise<ListResponseDto<ProductSearchResponseDto>> {
    return await this.searchService.findProductsWithOptionalQueryParams(query);
  }
}
