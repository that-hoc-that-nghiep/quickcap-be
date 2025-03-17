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

export class UpdateVideoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transcript?: string;

  @ApiProperty({ required: false })
  @Min(0, { message: 'Views must be greater than or equal to 0.' })
  @IsOptional()
  views?: number;
  @ApiProperty({ required: false })
  like?: number;

  @ApiProperty({ type: 'boolean', required: false })
  isNSFW?: boolean;

  @ApiProperty({ required: false })
  nsfwType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  categoryId?: string[];
}
