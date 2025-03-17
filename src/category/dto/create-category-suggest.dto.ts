import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategorySuggestDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  transcript: string;
}
