import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class HealthInfoDto {
  @IsBoolean()
  @IsNotEmpty()
  sterilization: boolean;

  @IsBoolean()
  @IsNotEmpty()
  microchip: boolean;

  @IsString()
  @IsNotEmpty()
  bloodGroup: string;

  @IsString()
  underlyingDisease: string;

  @IsString()
  allergy: string;

  @IsBoolean()
  @IsNotEmpty()
  hasBreakfast: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hasAfterBreakfast: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hasLunch: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hasAfterLunch: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hasDinner: boolean;

  @IsString()
  detail: string;
}

export class CreateDogDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsNumber()
  @IsNotEmpty()
  breedId: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  birthdate: Date;

  @ValidateNested()
  @Type(() => HealthInfoDto)
  @IsNotEmpty()
  healthInfo: HealthInfoDto;
}
