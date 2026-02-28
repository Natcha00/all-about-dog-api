import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { OfferingPackage } from '../enums/offering-package.enum';
import { OfferingType } from '../enums/offering-type.enum';

export class GetBoardingPackagePricingRequest {
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
  start: string;

  @IsDateString()
  end: string;

  @IsEnum(OfferingPackage)
  package: OfferingPackage;
}

// --- Response DTOs ---

export class PeriodDto {
  start: string;
  end: string;
  nights: number;
}

export class DogLineDto {
  dogId: number;
  name: string;
  breed: string;
  size: string;
  perNight: number;
  subtotal: number;
  groupNumber: number;
}

export class GroupDogDto {
  dogId: number;
  name: string;
  sizeLabel: string;
}

export class GroupDto {
  groupNumber: number;
  offerCode: string;
  offerLabel: string;
  capacity: number;
  dogIds: GroupDogDto[];
}

export class PricingSummaryDto {
  total: number;
  currency: string;
}

/** หนึ่ง line = หนึ่งแถวที่จะบันทึกใน reservation_line (offering + dog + price + quantity + groupNumber) */
export class ReservationLineDto {
  offeringId: number;
  dogId: number;
  price: number;
  quantity: number;
  groupNumber: number;
}

export class GetBoardingPackagePricingResponse {
  offerType: string;
  period: PeriodDto;
  package: string;
  dogs: DogLineDto[];
  groups: GroupDto[];
  pricingSummary: PricingSummaryDto;
  lines: ReservationLineDto[];
}
