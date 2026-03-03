import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CheckOutReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}
