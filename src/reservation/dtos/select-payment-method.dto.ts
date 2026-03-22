import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export class SelectPaymentMethodRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  /** สำหรับ staff: ระบุ dogOwnerId เพื่อทำรายการแทนลูกค้า */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dogOwnerId?: number;
}
