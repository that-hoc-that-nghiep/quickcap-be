import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { VideoType } from 'src/constants/video';

export class UpdateVideoDto {
  @ApiProperty()
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsString()
  summary?: string;

  @IsNumber()
  @Min(0, { message: 'Views must be greater than or equal to 0.' })
  views?: number;

  @IsEnum(VideoType)
  type?: VideoType;

  @IsArray()
  @ArrayNotEmpty()
  categoryId?: string[];
}
