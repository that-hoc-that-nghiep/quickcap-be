import { ApiProperty } from '@nestjs/swagger';

export class CategoryVideoModifyDto {
  @ApiProperty({ type: [String] })
  categoryId: string[];
}
