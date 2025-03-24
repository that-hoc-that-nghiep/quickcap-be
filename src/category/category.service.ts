import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';

import { CreateCategoryDto } from './dto/create-category.dto';

import { firstValueFrom } from 'rxjs';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { CategorySuggestRes } from './dto/category-suggest-res';

@Injectable()
export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    public readonly rabbitmqService: RabbitmqService,
  ) {}
  private readonly logger = new Logger(CategoryService.name);

  async getCategories(orgId: string) {
    const categories = await this.categoryRepository.getCategories(orgId);
    return { data: categories, message: 'Categories fetched successfully' };
  }
  async getCategoryByID(id: string) {
    const category = await this.categoryRepository.getCategoryByID(id);
    return { data: category, message: 'Category fetched successfully' };
  }

  async createCategory(orgId: string, createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const existingCategories = (
      await this.categoryRepository.getCategories(orgId)
    ).filter((c) => !c.isDeleted);

    const isDuplicate = existingCategories.some(
      (category) =>
        category.name.trim().toLowerCase() ===
        createCategoryDto.name.trim().toLowerCase(),
    );

    if (isDuplicate) {
      throw new BadRequestException('Category already exists.');
    }
    const category = await this.categoryRepository.createCatogory(orgId, name);
    return { data: category, message: 'Category created successfully' };
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.deleteCategory(id);
    return { data: category, message: 'Category deleted successfully' };
  }

  async suggestCategoryVideoByAi(orgId: string, transcript: string) {
    this.logger.log(`Prossing suggest category`);
    const categories = await this.categoryRepository.getCategories(orgId);
    const categoryNames = categories.map((category) => category.name);
    this.logger.log(`Category names: ${categoryNames}`);
    try {
      await this.rabbitmqService.ensureConnection();
      this.logger.log('Starting suggest category by ai');
      const resCategorySuggest = (await firstValueFrom(
        this.rabbitmqService.sendMessage<CategorySuggestRes>(
          { cmd: 'category-suggest' },
          {
            transcript: transcript,
            categories: categoryNames,
          },
        ),
      )) as CategorySuggestRes;
      this.logger.log('Finished suggest category by ai');
      return {
        data: resCategorySuggest,
        message: 'Category suggested by ai successfully',
      };
    } catch (error) {
      this.logger.error(`Error in suggest category by ai:`, error);
      throw new InternalServerErrorException('Error processing video');
    }
  }
}
