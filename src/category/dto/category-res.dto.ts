import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../category.schema';

export class CategoryResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Category })
  data: Category;
}
