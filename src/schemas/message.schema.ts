import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice',
  FILE = 'file',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  type: MessageType;

  @Prop()
  content: string; // Text content or URL for media

  @Prop()
  mediaUrl?: string;

  @Prop()
  mediaSize?: number;

  @Prop()
  mediaDuration?: number; // For voice/video

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  readBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
