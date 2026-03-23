import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Size } from 'src/dog/enums/size.enum';
import { CoatType } from 'src/dog/enums/coat-type.enum';

export class CreateBreedAdminDto {
  @IsString()
  @IsNotEmpty()
  nameTh: string;

  @IsString()
  @IsNotEmpty()
  nameEng: string;

  @IsEnum(Size)
  size: Size;
}

export class UpdateBreedAdminDto extends PartialType(CreateBreedAdminDto) {}

export class CreateOfferBreedPricingAdminDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  breedId: number;

  @IsNumber()
  @Min(0)
  normalPrice: number;

  @IsNumber()
  @Min(0)
  specialPrice: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber()
  minWeightKg?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber()
  maxWeightKg?: number | null;
}

export class UpdateOfferBreedPricingAdminDto extends PartialType(
  CreateOfferBreedPricingAdminDto,
) {}

export class CreateOfferCoatPricingAdminDto {
  @IsEnum(CoatType)
  coat: CoatType;

  @IsNumber()
  minWeightKg: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber()
  maxWeightKg?: number | null;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateOfferCoatPricingAdminDto extends PartialType(
  CreateOfferCoatPricingAdminDto,
) {}

export class CreateOfferSizePricingAdminDto {
  @IsNumber()
  @Min(0)
  normalPrice: number;

  @IsNumber()
  @Min(0)
  specialPrice: number;

  @IsEnum(Size)
  size: Size;
}

export class UpdateOfferSizePricingAdminDto extends PartialType(
  CreateOfferSizePricingAdminDto,
) {}

export class CreateOfferVipPricingAdminDto {
  @IsNumber()
  @Min(0)
  normalPrice: number;

  @IsNumber()
  @Min(0)
  specialPrice: number;
}

export class UpdateOfferVipPricingAdminDto extends PartialType(
  CreateOfferVipPricingAdminDto,
) {}
