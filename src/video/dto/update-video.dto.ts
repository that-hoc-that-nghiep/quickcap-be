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
  transcript?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0, { message: 'Views must be greater than or equal to 0.' })
  @IsOptional()
  views?: number;
  @ApiProperty({ required: false })
  @IsNumber()
  like?: number;

  @ApiProperty({ type: 'boolean', required: false })
  isNSFW?: boolean;

  @ApiProperty({ required: false })
  nsfwType?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  categoryId?: string[];
}
