import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/category/category.schema';
import { NSFWType } from 'src/constants/nsfw';
import { UserApp } from 'src/constants/user';

export type TaskDocument = HydratedDocument<Video>;

@Schema({ versionKey: false })
export class Video {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ default: 'Untilted Video' })
  title: string;

  @ApiProperty()
  @Prop({ default: 'No Description' })
  description: string;

  @ApiProperty()
  @Prop({ required: false })
  thumbnail: string;

  @ApiProperty()
  @Prop({ required: true })
  source: string;

  @ApiProperty({ type: UserApp })
  @Prop({ required: true })
  user: UserApp;

  @ApiProperty()
  @Prop({ required: true, type: [String] })
  orgId: string[];

  @ApiProperty()
  @Prop({ default: 0 })
  views: number;

  @ApiProperty()
  @Prop({ default: 0 })
  like: number;

  @ApiProperty()
  @Prop({ default: '' })
  transcript: string;

  @ApiProperty()
  @Prop([
    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    { default: [] },
  ])
  categoryId: Category[];

  @ApiProperty()
  @Prop({ default: Date.now() })
  createdAt: Date;

  @ApiProperty({ type: 'boolean', default: false })
  @Prop({ default: false })
  isNSFW: boolean;

  @ApiProperty({ default: NSFWType.NEUTRAL, enum: NSFWType })
  @Prop({ default: NSFWType.NEUTRAL, enum: NSFWType })
  nsfwType: NSFWType;

  @ApiProperty({ type: 'boolean', default: false })
  @Prop({ default: false })
  isDeleted: boolean;
}
export const VideoSchema = SchemaFactory.createForClass(Video);
