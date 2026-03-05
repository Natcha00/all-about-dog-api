import { IsInt, IsNotEmpty, Min, IsString } from 'class-validator';

export class ApproveReservationRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

}

