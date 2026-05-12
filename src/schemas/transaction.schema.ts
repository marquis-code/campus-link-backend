import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionPurpose {
  FUNDING = 'funding',
  WITHDRAWAL = 'withdrawal',
  EARNING = 'earning',
  PURCHASE = 'purchase',
  REFUND = 'refund',
  TRANSFER = 'transfer',
  ORDER_SETTLEMENT = 'order_settlement',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true })
  wallet: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ enum: TransactionPurpose, required: true })
  purpose: TransactionPurpose;

  @Prop({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ unique: true, sparse: true })
  reference: string;

  @Prop({ type: Object })
  metadata: any;

  @Prop()
  description: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });
