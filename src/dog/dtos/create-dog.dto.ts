import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BloodGroup } from '../enums/blood-group.enum';
import { CoatType } from '../enums/coat-type.enum';

export class HealthInfoDto {
  @IsBoolean()
  @IsNotEmpty()
  sterilization: boolean;

  @IsBoolean()
  @IsNotEmpty()
  microchip: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? BloodGroup.UNKNOWN : value,
  )
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsString()
  @IsOptional()
  underlyingDisease?: string;

  @IsString()
  @IsOptional()
  allergy?: string;

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
  @IsOptional()
  detail?: string;
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
  @IsOptional()
  color?: string;

  @IsEnum(CoatType)
  @IsNotEmpty()
  coatType: CoatType;

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

  @IsOptional()
  @IsString()
  @IsUrl()
  dogPictureUrl?: string;

  @ValidateNested()
  @Type(() => HealthInfoDto)
  @IsNotEmpty()
  healthInfo: HealthInfoDto;

  /** สำหรับ staff: ระบุ dogOwnerId เพื่อสร้างสุนัขให้ลูกค้า */
  @IsOptional()
  @IsInt()
  @Min(1)
  dogOwnerId?: number;
}
