import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { OfferingType } from '../enums/offering-type.enum';
import { OfferingPackage } from '../enums/offering-package.enum';
import { BoardingCounter } from '../types/boarding-counter.type';

export class GetOfferAvailableRequest {
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

export class GetOfferAvailableResponse {
  available: boolean;
  message: string;
  hint: string;
  range: {
    start: string;
    end: string;
  };
  nights: number;
  roomPerNight?:BoardingCounter
  package: OfferingPackage;
  need:BoardingCounter;
  fails:Array<FailDetail>
}

export type BoardingAvailabilityStatus = 'sufficient' | 'insufficient';

export type FailDetail = {
  date: string;
  status: BoardingAvailabilityStatus;
  need: BoardingCounter;
  left: BoardingCounter;
};

