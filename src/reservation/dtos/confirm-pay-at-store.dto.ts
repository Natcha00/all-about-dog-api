import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPayAtStoreRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}
