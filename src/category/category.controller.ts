import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category-res.dto';
import { CategoriesResponseDto } from './dto/categories-res.dto';

@ApiTags('Category')
@ApiSecurity('token')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      category_1: {
        value: {
          name: 'Math',
        } as CreateCategoryDto,
      },
      category_2: {
        value: {
          name: 'Physics',
        } as CreateCategoryDto,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: CategoryResponseDto,
  })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get a category by id' })
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully fetched.',
    type: CategoryResponseDto,
  })
  getCategoryByID(@Param('id') id: string) {
    return this.categoryService.getCategoryByID(id);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @Get()
  @ApiResponse({
    status: 200,
    description: 'The categories have been successfully fetched.',
    type: CategoriesResponseDto,
  })
  getCategories() {
    return this.categoryService.getCategories();
  }

  @ApiOperation({ summary: 'Delete a category by id' })
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
    type: CategoryResponseDto,
  })
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
