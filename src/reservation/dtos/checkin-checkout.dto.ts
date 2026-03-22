import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  /** เก่า: บาง client ส่งมา — ไม่บังคับ */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dogOwnerId?: number;
}

export class CheckOutReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  dogOwnerId: number;
}
