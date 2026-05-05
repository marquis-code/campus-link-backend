import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCampusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateCampusDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
