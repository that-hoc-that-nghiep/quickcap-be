import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { RoleChat } from 'src/constants/conversation';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ versionKey: false })
export class Conversation {
  @ApiProperty()
  @Prop({ required: true, enum: RoleChat })
  role: RoleChat;

  @ApiProperty()
  @Prop({ required: true })
  content: string;

  @ApiProperty()
  @Prop({ default: Date.now() })
  createdAt: Date;

  @ApiProperty()
  @Prop({ required: true })
  videoId: string;

  @ApiProperty()
  @Prop({ required: true })
  userId: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
