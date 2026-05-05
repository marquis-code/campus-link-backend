import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EarningDocument = Earning & Document;

export enum EarningStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  PAID = 'paid',
}

@Schema({ timestamps: true })
export class Earning {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  promoter: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: EarningStatus, default: EarningStatus.PENDING })
  status: EarningStatus;
}

export const EarningSchema = SchemaFactory.createForClass(Earning);

EarningSchema.index({ promoter: 1, status: 1 });
EarningSchema.index({ order: 1 });
