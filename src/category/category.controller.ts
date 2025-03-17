import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category-res.dto';
import { CategoriesResponseDto } from './dto/categories-res.dto';
import { CategorySuggestRes } from './dto/category-suggest-res';
import { CreateCategorySuggestDto } from './dto/create-category-suggest.dto';

@ApiTags('Category')
@ApiSecurity('token')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Post(':orgId')
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
  @ApiParam({ name: 'orgId', type: 'string' })
  createCategory(
    @Param('orgId') orgId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(orgId, createCategoryDto);
  }

  @Post('suggest/:orgId')
  @ApiOperation({
    summary: 'Suggest category for video',
  })
  @ApiParam({ name: 'orgId', type: 'string', required: true })
  @ApiResponse({
    status: 200,
    description: 'Category suggested by ai successfully',
    type: CategorySuggestRes,
  })
  @ApiBody({
    type: CreateCategorySuggestDto,
  })
  async suggestCategoryVideoByAi(
    @Param('orgId') orgId: string,
    @Body() createCategorySuggestDto: CreateCategorySuggestDto,
  ) {
    const { transcript } = createCategorySuggestDto;
    return this.categoryService.suggestCategoryVideoByAi(orgId, transcript);
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
  @Get('all/:orgId')
  @ApiResponse({
    status: 200,
    description: 'The categories have been successfully fetched.',
    type: CategoriesResponseDto,
  })
  @ApiParam({ name: 'orgId', type: 'string' })
  getCategories(@Param('orgId') orgId: string) {
    return this.categoryService.getCategories(orgId);
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
