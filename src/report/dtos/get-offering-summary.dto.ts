import { IsDateString, IsEnum } from 'class-validator';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';
import { CoatType } from 'src/dog/enums/coat-type.enum';

export class GetOfferingSummaryRequest {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsEnum(OfferingType)
  offeringType: OfferingType;
}

export class GetOfferingSummaryResponse {
  code: string;
  status: ReservationStatusEnum;
  startDateTime: Date;
  endDateTime: Date;
  remark: string;
  offeringType: OfferingType;
  price: number;
  quantity: number;
  groupNumber: number;
  buildingName: string;
  isVip: boolean;
  dogName: string;
  dogBreed: string;
  dogSize: string;
  dogCoat: CoatType;
  dogOwnerName: string;
}