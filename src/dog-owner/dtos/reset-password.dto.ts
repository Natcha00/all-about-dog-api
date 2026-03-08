import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณาระบุอีเมล' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ OTP' })
  @Length(6, 6, { message: 'OTP ต้องมี 6 หลัก' })
  otp: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านใหม่' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  @MaxLength(100)
  newPassword: string;
}
