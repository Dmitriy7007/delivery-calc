import { IsString, IsNumber, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsInt()
  cityId: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  workHoursFrom?: string;

  @IsString()
  @IsOptional()
  workHoursTo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  workHoursFrom?: string;

  @IsString()
  @IsOptional()
  workHoursTo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
