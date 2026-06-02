import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  geocenterLng?: number;

  @IsNumber()
  @IsOptional()
  geocenterLat?: number;

  @IsInt()
  @IsOptional()
  defaultZoom?: number;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  geocenterLng?: number;

  @IsNumber()
  @IsOptional()
  geocenterLat?: number;

  @IsInt()
  @IsOptional()
  defaultZoom?: number;

  @IsString()
  @IsOptional()
  timezone?: string;
}
