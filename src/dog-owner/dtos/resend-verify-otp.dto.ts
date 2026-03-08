import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerifyOtpDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณาระบุอีเมล' })
  email: string;
}
