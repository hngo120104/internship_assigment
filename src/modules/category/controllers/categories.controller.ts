import { Controller, Get, Injectable } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { CategoriesService } from '../services/categories.service';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Injectable()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  async findManyActiveCategories(): Promise<
    ListResponseDto<CategoryResponseDto>
  > {
    const foundActiveCategories =
      await this.categoriesService.findManyActiveCategories(1, 20);
    return new ListResponseDto(foundActiveCategories);
  }
}
