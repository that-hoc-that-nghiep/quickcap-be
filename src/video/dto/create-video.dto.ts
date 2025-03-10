import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  transcript: string;

  @IsArray()
  @ArrayMinSize(1)
  categoryId: string[];
}
