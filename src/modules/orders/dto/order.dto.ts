import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../../schemas/order.schema';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @IsString()
  @IsNotEmpty()
  buyerPhone: string;

  @IsString()
  @IsOptional()
  buyerEmail?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  referralCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
