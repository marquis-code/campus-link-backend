import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../../schemas/product.schema';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  commissionAmount: number;

  @IsString()
  @IsNotEmpty()
  campus: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  sellerWhatsapp?: string;

  @IsString()
  @IsOptional()
  sellerPhone?: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  commissionAmount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  sellerWhatsapp?: string;

  @IsString()
  @IsOptional()
  sellerPhone?: string;
}

export class UpdateProductStatusDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  campus?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

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

  @IsOptional()
  @IsString()
  sort?: string;
}
