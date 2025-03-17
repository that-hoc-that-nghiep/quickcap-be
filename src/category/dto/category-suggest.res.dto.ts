import { ApiProperty } from '@nestjs/swagger';
import { CategorySuggestRes } from './category-suggest-res';

export class CategorySuggestResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CategorySuggestRes })
  data: CategorySuggestRes;
}
