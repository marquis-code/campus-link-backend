import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'student',
  SELLER = 'seller',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Campus' })
  campus: Types.ObjectId;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true })
  firebaseUid?: string;

  @Prop()
  avatar: string;

  @Prop()
  bankName: string;

  @Prop()
  bankAccountNumber: string;

  @Prop()
  bankAccountName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
