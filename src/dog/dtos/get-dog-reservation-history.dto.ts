import { OfferingType } from 'src/offering/enums/offering-type.enum';

export class DogReservationHistoryItemDto {
  offeringType: OfferingType;
  code: string;

  /** สำหรับ boarding: วันที่เข้า */
  startDate?: string;
  /** สำหรับ boarding: วันที่ออก */
  endDate?: string;

  /** สำหรับ swimming: วันที่ใช้บริการ */
  date?: string;
  /** สำหรับ swimming: รอบเวลา (เช่น 10:00) */
  time?: string;
}

