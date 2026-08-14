import { Controller, Get, Injectable } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { CategoriesService } from '../services/categories.service';

@Injectable()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  async findManyActiveCategories() {
    const foundActiveCategories =
      await this.categoriesService.findManyActiveCategories(1, 20);
    return foundActiveCategories;
  }
}
