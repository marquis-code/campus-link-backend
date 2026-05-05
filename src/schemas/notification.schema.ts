import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ORDER = 'order',
  EARNING = 'earning',
  WITHDRAWAL = 'withdrawal',
  PRODUCT = 'product',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object })
  meta: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ user: 1, isRead: 1 });
