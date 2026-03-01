import { IsNotEmpty, IsString } from 'class-validator';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

export class GetReservationDetailRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}

// --- Result (nested DTOs) ---

export class GetReservationDetailPackageDto {
  code: string;
  label: string;
}

export class GetReservationDetailPeriodDto {
  start: string;
  end: string;
}

export class GetReservationDetailPetIdDto {
  petId: number;
  name: string;
  sizeLabel: string;
}

export class GetReservationDetailGroupDto {
  groupNumber: number;
  offerCode: string;
  offerLabel: string;
  capacity: number;
  petIds: GetReservationDetailPetIdDto[];
}


export class GetReservationDetailActionsDto {
  canViewTimeline: boolean;
  canUploadSlip: boolean;
  canCancel: boolean;
  cancelHint: string;
}

export class GetReservationDetailSlipDto {
  required: boolean;
  status: string;
  imageUrl: string;
  /** เหตุผลที่ปฏิเสธสลิป (มีเมื่อเคยถูก reject) */
  rejectedReason?: string;
}

export class GetReservationDetailTimelineItemDto {
  key: string;
  label: string;
  at: string | null;
  by?: string | null;
}

export class GetReservationDetailResultResponse {
  bookingCode: string;
  status: ReservationStatusEnum;
  statusLabel: string;
  statusHint: string;
  statusTone: string;
  serviceType: OfferingType;
  serviceLabel: string;
  package: GetReservationDetailPackageDto;
  period: GetReservationDetailPeriodDto;
  totalPrice: number;
  groups: GetReservationDetailGroupDto[];
  note: string;
  actions: GetReservationDetailActionsDto;
  slip: GetReservationDetailSlipDto;
  timeline: GetReservationDetailTimelineItemDto[];
}

export class GetReservationDetailResponse {
  statusCode: number;
  result: GetReservationDetailResultResponse;
}

