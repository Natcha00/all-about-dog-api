import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDogOwnerDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อ' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุนามสกุล' })
  @MaxLength(100)
  lastName: string;

  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุเบอร์โทรศัพท์' })
  @MinLength(9, { message: 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก' })
  @MaxLength(20)
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  profilePictureUrl?: string;
}
