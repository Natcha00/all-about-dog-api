import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { OfferingPackage } from 'src/offering/enums/offering-package.enum';

export class ConfirmReservationPeriodDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}

export class ConfirmReservationLineDto {
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

export class ConfirmReservationRequest {
  @IsEnum(OfferingType)
  offerType: OfferingType;

  @ValidateNested()
  @Type(() => ConfirmReservationPeriodDto)
  period: ConfirmReservationPeriodDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  nights?: number;

  @IsOptional()
  @IsString()
  remark?: string;

   /** สำหรับกรณี staff ยืนยันแทนลูกค้า */
  @IsOptional()
  @IsInt()
  @Min(1)
  dogOwnerId?: number;

  @IsEnum(OfferingPackage)
  package: OfferingPackage;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmReservationLineDto)
  lines: ConfirmReservationLineDto[];
}
