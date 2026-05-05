import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateCopyDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  tone?: string; // casual, professional, urgent
}
