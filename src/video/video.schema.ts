import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/category/category.schema';
import { NSFWType } from 'src/constants/nsfw';
import { VideoType } from 'src/constants/video';

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
  @Prop({ required: true })
  source: string;

  @ApiProperty()
  @Prop({ required: true })
  userId: string;

  @ApiProperty()
  @Prop({ required: true, type: [String] })
  orgId: string[];

  @ApiProperty()
  @Prop({ default: 0 })
  views: number;

  @ApiProperty({
    enum: VideoType,
    examples: {
      private: VideoType.PRIVATE,
      public: VideoType.PUBLIC,
    },
  })
  @Prop({
    enum: VideoType,
    default: VideoType.PRIVATE,
  })
  type: VideoType;

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

  @ApiProperty()
  @Prop({ default: false })
  isNSFW: boolean;

  @ApiProperty()
  @Prop({ default: NSFWType.NEUTRAL, enum: NSFWType })
  nsfwType: NSFWType;

  @ApiProperty({ type: 'boolean', default: false })
  @Prop({ default: false })
  isDeleted: boolean;
}
export const VideoSchema = SchemaFactory.createForClass(Video);
