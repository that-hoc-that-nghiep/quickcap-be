import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'aws-sdk/clients/budgets';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserComment } from './dto/user-comment.dto';

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

  @ApiProperty({ type: UserComment })
  @Prop({ required: true })
  user: UserComment;

  @ApiProperty()
  @Prop({ default: Date.now() })
  createdAt: Date;

  @ApiProperty({ type: 'boolean', default: false })
  @Prop({ default: false })
  isDeleted: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
