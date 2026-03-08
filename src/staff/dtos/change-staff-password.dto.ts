import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangeStaffPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านเดิม' })
  @MinLength(6)
  @MaxLength(100)
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านใหม่' })
  @MinLength(6, { message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' })
  @MaxLength(100)
  newPassword: string;
}
