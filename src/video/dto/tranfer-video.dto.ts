import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TranferVideoDto {
  @ApiProperty({ required: true })
  @IsString()
  videoId: string;

  @ApiProperty({ required: true })
  @IsString()
  orgId: string;
}
