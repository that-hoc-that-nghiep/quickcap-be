import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../category.schema';

export class CategoriesResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Category] })
  data: Category[];
}
