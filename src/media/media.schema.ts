import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ versionKey: false })
export class Media {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ default: null })
  screen: string;

  @ApiProperty()
  @Prop({ default: null })
  audio: string;

  @ApiProperty()
  @Prop({ default: null })
  camera: string;

  @ApiProperty()
  @Prop({ required: true })
  userId: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
