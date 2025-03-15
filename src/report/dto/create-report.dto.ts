import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsMongoId, IsString } from 'class-validator';
import { ReportType } from 'src/constants/report';

export class CreateReportDto {
  @ApiProperty({ type: String })
  videoId: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ type: String })
  @IsString()
  content: string;
}
