import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { create } from 'domain';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { userInfo } from 'os';

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
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get a category by id' })
  @Get(':id')
  getCategoryByID(@Param('id') id: string) {
    return this.categoryService.getCategoryByID(id);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @Get()
  getCategories() {
    return this.categoryService.getCategories();
  }

  @ApiOperation({ summary: 'Delete a category by id' })
  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
