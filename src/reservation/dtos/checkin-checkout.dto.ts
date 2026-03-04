import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CheckInReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  dogOwnerId: number;
}

export class CheckOutReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  dogOwnerId: number;
}
