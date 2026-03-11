import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { OfferingPackage } from 'src/offering/enums/offering-package.enum';

export class CreateReservationPeriodDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}

export class CreateReservationLineDto {
  @IsInt()
  @Min(1)
  offeringId: number;

  @IsInt()
  @Min(1)
  dogId: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  groupNumber: number;
}

export class CreateReservationRequest {
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

  @IsOptional()
  @IsString()
  remark?: string;

  /** สำหรับกรณี staff ยืนยันแทนลูกค้า */
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined,
  )
  @IsInt()
  @Min(1)
  dogOwnerId?: number;
}
