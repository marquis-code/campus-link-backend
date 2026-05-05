import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateReferralDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
