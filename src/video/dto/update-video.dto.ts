import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VideoType } from 'src/constants/video';

export class UpdateVideoDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0, { message: 'Views must be greater than or equal to 0.' })
  @IsOptional()
  views?: number;

  @ApiProperty({ required: false })
  @IsEnum(VideoType)
  @IsOptional()
  type?: VideoType;

  @ApiProperty({ required: false })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  categoryId?: string[];
}
