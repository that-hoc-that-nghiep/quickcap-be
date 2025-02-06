import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty()
  @ArrayNotEmpty() 
  @IsString({ each: true }) 
  categoryId: string[];
}
