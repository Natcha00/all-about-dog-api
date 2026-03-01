import { IsOptional, IsString } from 'class-validator';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

export class GetReservationsRequest {
  @IsOptional()
  @IsString()
  tab?: string;
}

/** Counts ตรงกับ ReservationStatusEnum (หนึ่งฟิลด์ต่อ status) */
export class GetReservationsCountsDto {
  [ReservationStatusEnum.PENDING]: number;
  [ReservationStatusEnum.WAITING_SLIP]: number;
  [ReservationStatusEnum.SLIP_UPLOADED]: number;
  [ReservationStatusEnum.SLIP_VERIFIED]: number;
  [ReservationStatusEnum.CHECK_IN]: number;
  [ReservationStatusEnum.FINISHED]: number;
  [ReservationStatusEnum.CANCELLED]: number;
}

export class GetReservationsDogItemDto {
  name: string;
}

export class GetReservationsTimeSlotDto {
  start: string;
  end: string;
}

export class GetReservationItemDto {
  id: string;
  status: string;
  serviceType: string;
  statusLabel: string;
  dogs: GetReservationsDogItemDto[];
  dogsLabel: string;
  totalPrice: number;
  date?: string;
  timeSlot?: GetReservationsTimeSlotDto;
  checkInDate?: string;
  checkOutDate?: string;
}

export class GetReservationsResponse {
  counts: GetReservationsCountsDto;
  items: GetReservationItemDto[];
}
