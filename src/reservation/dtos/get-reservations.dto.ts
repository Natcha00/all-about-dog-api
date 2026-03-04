import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

export class GetReservationsRequest {
  @IsOptional()
  @IsString()
  tab?: string;

  /** สำหรับ staff: ไม่ส่ง = ดูทุกลูกค้า, ส่ง = เจาะจงลูกค้าที่ระบุ */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dogOwnerId?: number;
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
  /** เจ้าของการจอง (มีเมื่อ staff ดูรายการทั้งหมด) */
  dogOwnerId?: number;
  dogOwnerLabel?: string;
}

export class GetReservationsResponse {
  counts: GetReservationsCountsDto;
  items: GetReservationItemDto[];
}
