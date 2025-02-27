import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async createCatogory(
    createCatogoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { name } = createCatogoryDto;
    const newCategory = await this.categoryModel.create({ name });
    return newCategory;
  }

  async getCategories(): Promise<Category[]> {
    const categories = await this.categoryModel.find().exec();
    return categories;
  }

  async getCategoryByID(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException(`Category id ${id} not found`);
    return category;
  }

  async deleteCategory(id: string): Promise<Category> {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) throw new NotFoundException(`Category id ${id} not found`);
    return category;
  }

  async getCategoryByArrayId(ids: string[]): Promise<Category[]> {
    const categories = this.categoryModel.find({ _id: { $in: ids } });
    return categories;
  }
}
