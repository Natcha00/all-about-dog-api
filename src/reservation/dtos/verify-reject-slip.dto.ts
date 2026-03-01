import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySlipRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RejectSlipRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
