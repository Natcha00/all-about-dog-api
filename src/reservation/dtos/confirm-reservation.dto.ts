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
  @IsEnum(OfferingType)
  offerType: OfferingType;

  @ValidateNested()
  @Type(() => CreateReservationPeriodDto)
  period: CreateReservationPeriodDto;

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
  @Type(() => CreateReservationLineDto)
  lines: CreateReservationLineDto[];
}
