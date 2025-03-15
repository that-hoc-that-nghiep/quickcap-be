import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { ReportType } from 'src/constants/report';
import { UserApp } from 'src/constants/user';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ versionKey: false })
export class Report {
  @ApiProperty({ type: String })
  _id: string;
  @ApiProperty({ type: UserApp })
  @Prop({ required: true })
  user: UserApp;

  @ApiProperty()
  @Prop({ required: true })
  videoId: string;

  @ApiProperty({
    enum: ReportType,
    examples: {
      [ReportType.VIOLENCE]: ReportType.VIOLENCE,
      [ReportType.PORNOGRAPHY]: ReportType.PORNOGRAPHY,
      [ReportType.SEXUAL_CONTENT]: ReportType.SEXUAL_CONTENT,
      [ReportType.ADULT_ANIME]: ReportType.ADULT_ANIME,
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
