import { ApiProperty } from '@nestjs/swagger';
import { Video } from 'src/video/video.schema';
export enum VideoType {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
