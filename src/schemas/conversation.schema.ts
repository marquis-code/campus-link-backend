import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;

  @Prop({ default: false })
  isSupport: boolean;

  @Prop({ type: String })
  subject?: string; // For support tickets

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
