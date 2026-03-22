import { ReservationStatusEnum } from './enums/reservation-status.enum';

/** นับเข้าที่ว่างในสระ / รอบว่ายน้ำ */
export const SWIMMING_POOL_OCCUPYING_STATUSES: ReadonlySet<ReservationStatusEnum> =
  new Set([
    ReservationStatusEnum.PAY_AT_STORE,
    ReservationStatusEnum.SLIP_VERIFIED,
    ReservationStatusEnum.CHECK_IN,
    ReservationStatusEnum.FINISHED,
  ]);

/** นับเข้าจำนวนห้องฝากเลี้ยงที่ใช้แล้ว */
export const BOARDING_ROOM_OCCUPYING_STATUSES: ReadonlySet<ReservationStatusEnum> =
  new Set([
    ReservationStatusEnum.SLIP_VERIFIED,
    ReservationStatusEnum.CHECK_IN,
    ReservationStatusEnum.FINISHED,
  ]);

export function countsTowardSwimmingPoolCapacity(
  status: ReservationStatusEnum,
): boolean {
  return SWIMMING_POOL_OCCUPYING_STATUSES.has(status);
}

export function countsTowardBoardingRoomCapacity(
  status: ReservationStatusEnum,
): boolean {
  return BOARDING_ROOM_OCCUPYING_STATUSES.has(status);
}
