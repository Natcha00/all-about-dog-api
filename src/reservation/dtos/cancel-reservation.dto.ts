import { IsNotEmpty, IsString } from 'class-validator';

export class CancelReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}
