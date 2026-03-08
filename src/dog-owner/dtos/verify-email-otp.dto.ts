import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณาระบุอีเมล' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ OTP' })
  @Length(6, 6, { message: 'OTP ต้องมี 6 หลัก' })
  otp: string;
}
