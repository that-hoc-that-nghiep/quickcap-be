import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ versionKey: false })
export class Invite {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  senderId: string;

  @ApiProperty()
  @Prop({ required: true })
  receiverId: string;

  @ApiProperty()
  @Prop({ required: true })
  emailReceiver: string;

  @ApiProperty()
  @Prop({ required: true })
  content: string;

  @ApiProperty()
  @Prop({ required: true })
  orgId: string;

  @ApiProperty()
  @Prop({ default: false })
  accepted: boolean;
}
export const InviteSchema = SchemaFactory.createForClass(Invite);
