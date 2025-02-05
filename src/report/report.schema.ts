import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { ReportType } from 'src/constants/report';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ versionKey: false })
export class Report {
  @ApiProperty()
  @Prop({ required: true })
  userId: string;

  @ApiProperty()
  @Prop({ required: true })
  videoId: string;

  @ApiProperty({
    enum: ReportType,
    examples: {
      [ReportType.VIOLENCE]: ReportType.VIOLENCE,
      [ReportType.HATE_SPEECH]: ReportType.HATE_SPEECH,
      [ReportType.HARASSMENT]: ReportType.HARASSMENT,
      [ReportType.TERRORISM]: ReportType.TERRORISM,
    },
  })
  @Prop({ required: true, enum: ReportType })
  type: string;

  @ApiProperty()
  @Prop({ required: true })
  content: string;

  @ApiProperty()
  @Prop({ default: false })
  approved: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
