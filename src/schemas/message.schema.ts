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

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender?: Types.ObjectId;

  @Prop({ type: Object })
  guestSender?: {
    name: string;
    email: string;
    phone: string;
  };

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

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  readBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
