import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class ChunkUploadDto {
  @ApiProperty({ description: 'Unique identifier for the file' })
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Current chunk index (0-based)' })
  @IsNumber()
  @Min(0)
  chunkIndex: number;

  @ApiProperty({ description: 'Total number of chunks' })
  @IsNumber()
  @Min(1)
  totalChunks: number;
}
