import { ApiProperty } from '@nestjs/swagger';
import { Media } from '../media.schema';

export class MediaResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Media })
  data: Media;
}
