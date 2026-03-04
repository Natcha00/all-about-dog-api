import { IsNotEmpty, IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';

export class CancelReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  /** สำหรับกรณี staff ยกเลิกแทนลูกค้า */
  @IsOptional()
  @IsInt()
  @Min(1)
  dogOwnerId?: number;

  /** บังคับเมื่อ staff ยกเลิก: เหตุผลที่ยกเลิก (สูงสุด 220 ตัวอักษร เพื่อให้รวมกับข้อความนำไม่เกินความยาว label ใน DB) */
  @IsOptional()
  @IsString()
  @MaxLength(220)
  cancelReason?: string;
}
