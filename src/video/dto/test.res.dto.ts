import { ApiProperty } from '@nestjs/swagger';
import { VideoCategory } from 'src/constants';

export class CheckNSFWRes {
  @ApiProperty()
  videoId: string;

  @ApiProperty({
    enum: VideoCategory,
    enumName: 'VideoCategory',
    description:
      'The dominant category of the video, values are: Drawing, Hentai, Neutral, Porn, Sexy',
  })
  dominantCategory: VideoCategory;

  @ApiProperty({
    description:
      'The breakdown of the video in each category, values are: Drawing, Hentai, Neutral, Porn, Sexy',
  })
  categoryBreakdown: {
    Drawing: number;
    Hentai: number;
    Neutral: number;
    Porn: number;
    Sexy: number;
  };
  @ApiProperty()
  isNSFW: boolean;
}
