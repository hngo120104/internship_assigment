import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryCreateRequestDto } from '../dto/request/category.create.request.dto';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { CategoryUpdateRequestDto } from '../dto/request/category.update.request.dto';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async createCategoryOrThrow(
    categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    if (categoryCreateDto.parentId) {
      const parentCategory = await this.categoriesRepo.findActiveCategoryById(
        categoryCreateDto.parentId,
      );
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found.');
      }
    }
    const createdCategory =
      await this.categoriesRepo.createCategory(categoryCreateDto);
    return toResponseDto(CategoryResponseDto, createdCategory);
  }

  async findAllActiveCategories(
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<CategoryResponseDto>> {
    const [foundActiveCategories, count] =
      await this.categoriesRepo.findAllActiveCategories(
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(
      CategoryResponseDto,
      foundActiveCategories,
    );
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    if (categoryUpdateDto.parentId === categoryId) {
      throw new BadRequestException(
        'Parent category and child category must not be the same.',
      );
    }
    const updatedCategory = await this.categoriesRepo.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
    return toResponseDto(CategoryResponseDto, updatedCategory);
  }
}
