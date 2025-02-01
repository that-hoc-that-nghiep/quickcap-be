import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ versionKey: false })
export class Task {
  @ApiProperty({ uniqueItems: true })
  @Prop({ required: true, unique: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  description: string;
}
export const TaskSchema = SchemaFactory.createForClass(Task);
