import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { UserApp } from 'src/constants/user';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ versionKey: false })
export class Comment {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  content: string;

  @ApiProperty()
  @Prop({ required: true })
  videoId: string;

  @ApiProperty({ type: UserApp })
  @Prop({ required: true })
  user: UserApp;

  @ApiProperty()
  @Prop({ default: Date.now() })
  createdAt: Date;

  @ApiProperty({ type: 'boolean', default: false })
  @Prop({ default: false })
  isDeleted: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
