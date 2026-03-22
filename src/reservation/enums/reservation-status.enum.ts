export enum ReservationStatusEnum {
  PENDING = 'pending',
  WAITING_SLIP = 'waiting_slip',
  SLIP_UPLOADED = 'slip_uploaded',
  /** รอชำระเงินหน้าร้าน (ว่ายน้ำ: กันคิว/หักที่สระแล้ว — ฝากเลี้ยง: ยังไม่กันห้อง) */
  PAY_AT_STORE = 'pay_at_store',
  SLIP_VERIFIED = 'slip_verified',
  CHECK_IN = 'check_in',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}
