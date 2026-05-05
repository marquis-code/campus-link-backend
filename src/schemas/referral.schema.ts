import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true })
export class Referral {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  promoter: Types.ObjectId;

  @Prop({ required: true, unique: true })
  referralCode: string;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: 0 })
  orders: number;

  @Prop({ default: 0 })
  earnings: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

// Compound index: one referral per promoter per product
ReferralSchema.index({ product: 1, promoter: 1 }, { unique: true });
