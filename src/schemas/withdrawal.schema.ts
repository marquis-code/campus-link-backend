import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Withdrawal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop()
  bankName: string;

  @Prop()
  bankAccountNumber: string;

  @Prop()
  bankAccountName: string;

  @Prop({ enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Prop()
  adminNote: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy: Types.ObjectId;

  @Prop()
  processedAt: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);

WithdrawalSchema.index({ user: 1, status: 1 });
