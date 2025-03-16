import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Video } from 'src/video/video.schema';
export enum VideoType {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export class VideoAdds {
  @ApiProperty({ type: String })
  @IsString()
  videoId: string;
  @ApiProperty({ type: String })
  @IsString()
  orgId: string;
  @ApiProperty({ type: String })
  @IsString()
  categoryId: string;
}
