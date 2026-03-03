import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}

