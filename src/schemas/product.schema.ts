import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seller: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campus', required: true })
  campus: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  commissionAmount: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  sellerWhatsapp: string;

  @Prop()
  sellerPhone: string;

  @Prop({ enum: ProductStatus, default: ProductStatus.PENDING })
  status: ProductStatus;

  @Prop({ default: 0 })
  totalSales: number;

  @Prop({ default: 0 })
  totalPromoters: number;

  @Prop()
  aiGeneratedCopy: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for efficient queries
ProductSchema.index({ campus: 1, status: 1 });
ProductSchema.index({ seller: 1 });
ProductSchema.index({ category: 1 });
