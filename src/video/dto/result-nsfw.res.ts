import { ApiProperty } from '@nestjs/swagger';
import { NSFWType } from 'src/constants/nsfw';


export class ResultNSFWRes {
  videoId: string;

  dominantCategory: NSFWType;

  categoryBreakdown: {
    Drawing: number;
    Hentai: number;
    Neutral: number;
    Porn: number;
    Sexy: number;
  };
  isNSFW: boolean;
}
