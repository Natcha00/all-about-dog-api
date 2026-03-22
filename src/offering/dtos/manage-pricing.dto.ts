import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BoardingPricingItemDto {
  offeringId: number;
  offeringName: string;
  isVip: boolean;
  pricingId: number;
  normalPrice: number;
  specialPrice: number;
}

export class SwimmingPricingItemDto {
  pricingId: number;
  coat: string;
  minWeightKg: number;
  maxWeightKg: number | null;
  price: number;
}

export class GetManagePricingResponse {
  boarding: BoardingPricingItemDto[];
  swimming: SwimmingPricingItemDto[];
}

export class UpdateBoardingPricingItemRequest {
  @IsInt()
  @Min(1)
  pricingId: number;

  @IsNumber()
  @Min(0)
  normalPrice: number;

  @IsNumber()
  @Min(0)
  specialPrice: number;
}

export class UpdateSwimmingPricingItemRequest {
  @IsInt()
  @Min(1)
  pricingId: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateManagePricingRequest {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBoardingPricingItemRequest)
  boarding?: UpdateBoardingPricingItemRequest[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSwimmingPricingItemRequest)
  swimming?: UpdateSwimmingPricingItemRequest[];
}
