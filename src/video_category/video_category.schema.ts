import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/category/category.schema';
import { Video } from 'src/video/video.schema';

export type VideoCategoryDocument = HydratedDocument<VideoCategory>;

@Schema({ versionKey: false })
export class VideoCategory {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: Video, required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true })
  videoId: string;

  @ApiProperty({ type: Category, required: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: string;
}

export const VideoCategorySchema = SchemaFactory.createForClass(VideoCategory);
