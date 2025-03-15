import { ApiProperty } from '@nestjs/swagger';
import { Report } from '../report.schema';

export class ReportsRes {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Report] })
  data: Report[];
}
