import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @ApiProperty({ required: true })
  @IsString()
  screen: string;

  @ApiProperty({ required: true })
  @IsString()
  audio: string;

  @ApiProperty({ required: true })
  @IsString()
  camera: string;

  @ApiProperty({ required: true })
  @IsString()
  userId: string;
}
