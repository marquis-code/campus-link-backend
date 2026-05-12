import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(100)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @IsString()
  @IsOptional()
  bankAccountName?: string;

  @IsString()
  @IsOptional()
  bankCode?: string;
}

export class UpdateWithdrawalStatusDto {
  @IsString()
  status: string; // approved, rejected, processing, completed

  @IsString()
  @IsOptional()
  adminNote?: string;
}
