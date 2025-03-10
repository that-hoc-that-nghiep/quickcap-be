import { ApiProperty } from '@nestjs/swagger';
import { NSWFType } from 'src/constants/nswf';

export class ResultNSFWRes {
  videoId: string;

  dominantCategory: NSWFType;

  categoryBreakdown: {
    Drawing: number;
    Hentai: number;
    Neutral: number;
    Porn: number;
    Sexy: number;
  };
  isNSFW: boolean;
}
