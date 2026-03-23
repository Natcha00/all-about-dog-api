import { Size } from 'src/dog/enums/size.enum';

/**
 * Fixed offering primary keys (matches seed order in offering.json).
 * 1 ตึกหมาใหญ่ · 2 ตึกหมาเล็ก · 3 VIP ฝากเลี้ยง · 4 ว่ายน้ำ
 */
export const OFFERING_ID = {
  BOARDING_LARGE: 1,
  BOARDING_SMALL: 2,
  BOARDING_VIP: 3,
  SWIMMING: 4,
} as const;

/** ฝากตามขนาดห้อง: large → ตึกใหญ่, small → ตึกเล็ก */
export function offeringIdForBoardingSize(size: Size): number {
  if (size === Size.LARGE) return OFFERING_ID.BOARDING_LARGE;
  if (size === Size.SMALL) return OFFERING_ID.BOARDING_SMALL;
  throw new Error(`Unknown boarding size: ${String(size)}`);
}
