import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seller: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  promoter: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Referral' })
  referral: Types.ObjectId;

  @Prop({ required: true })
  buyerName: string;

  @Prop({ required: true })
  buyerPhone: string;

  @Prop()
  buyerEmail: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  commissionAmount: number;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop()
  bankName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  accountName: string;

  @Prop()
  paymentReference: string;

  @Prop()
  notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ seller: 1, status: 1 });
OrderSchema.index({ promoter: 1 });
OrderSchema.index({ product: 1 });
