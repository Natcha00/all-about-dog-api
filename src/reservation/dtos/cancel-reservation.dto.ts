import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CancelReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  /** สำหรับกรณี staff ยกเลิกแทนลูกค้า */
  @IsOptional()
  @IsInt()
  @Min(1)
  dogOwnerId?: number;
}
