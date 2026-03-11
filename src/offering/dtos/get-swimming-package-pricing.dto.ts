import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { OfferingType } from "../enums/offering-type.enum";
import { Transform } from "class-transformer";
import { OfferingPackage } from "../enums/offering-package.enum";
import { CoatType } from "src/dog/enums/coat-type.enum";

export class GetSwimmingPackagePricingRequest {
    @Transform(({ value }) =>
      typeof value === 'string'
        ? value.split(',').map((v: string) => Number(v.trim()))
        : value,
    )
    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true })
    dogIds: number[];

    @IsEnum(OfferingType)
    offeringType: OfferingType;

    @IsDateString()
    date: string;

    @IsEnum(OfferingPackage)
    package: OfferingPackage;

    /** สำหรับ staff: ระบุ dogOwnerId เพื่อดูข้อมูลของลูกค้า */
    @IsOptional()
    @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
    @IsInt()
    @Min(1)
    dogOwnerId?: number;
}

// --- Response DTOs ---

export class SwimmingSelectedDto {
  time: string;
  isVip: boolean;
  ownerPlay: boolean;
  noteOpen: boolean;
}

export class SwimmingPetsSummaryDto {
  total: number;
  small: number;
  large: number;
  label: string;
}

export class SwimmingRulesDto {
  ownerPlayHint: string;
  slotHint: string;
}

export class SwimmingSlotSizeBookedDto {
  large: number;
  small: number;
}

export class SwimmingSlotDto {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  statusLabel: string;
  isFull: boolean;
  isEmpty: boolean;
  sizeBooked: SwimmingSlotSizeBookedDto;
}

export class SwimmingPricingItemDto {
  dogId: number;
  name: string;
  breed: string;
  price: number;
  coatType: CoatType;
}

export class SwimmingPricingDto {
  currency: string;
  items: SwimmingPricingItemDto[];
  total: number;
}

export class ReservationLineDto {
  offeringId: number;
  dogId: number;
  price: number;
  quantity: number;
  groupNumber: number;
}

export class GetSwimmingPackagePricingResponse {
  offerType: string;
  date: string;
  petsSummary: SwimmingPetsSummaryDto;
  rules: SwimmingRulesDto;
  slots: SwimmingSlotDto[];
  pricing: SwimmingPricingDto;
  lines: ReservationLineDto[];
}
