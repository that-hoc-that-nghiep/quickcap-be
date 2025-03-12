import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

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
    const category = await this.categoryRepository.createCatogory(orgId, name);
    return { data: category, message: 'Category created successfully' };
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.deleteCategory(id);
    return { data: category, message: 'Category deleted successfully' };
  }
}
