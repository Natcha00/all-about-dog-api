import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class VerifySlipRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  dogOwnerId: number;
}

export class RejectSlipRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
