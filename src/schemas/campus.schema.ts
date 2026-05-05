import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampusDocument = Campus & Document;

@Schema({ timestamps: true })
export class Campus {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  location: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CampusSchema = SchemaFactory.createForClass(Campus);
