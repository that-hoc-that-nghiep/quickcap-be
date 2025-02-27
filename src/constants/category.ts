import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/category.schema';

export class ResponseCategory {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Category })
  data: Category;
}

export class ResponseCategories {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Category] })
  data: Category[];
}
