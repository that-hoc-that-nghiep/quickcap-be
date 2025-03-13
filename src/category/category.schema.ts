import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ versionKey: false })
export class Category {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true })
  orgId: string;

  @ApiProperty()
  @Prop({ default: false })
  isDeleted: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
