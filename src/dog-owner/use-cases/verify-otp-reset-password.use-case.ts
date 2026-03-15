import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';
import { DogOwnerOtpRepository } from '../dog-owner-otp.repository';
import { VerifyOtpResetPasswordDto } from '../dtos/verify-otp-reset-password.dto';
import { OtpType } from '../enums/otp-type.enum';

@Injectable()
export class VerifyOtpResetPasswordUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly dogOwnerOtpRepository: DogOwnerOtpRepository,
  ) {}

  async execute(dto: VerifyOtpResetPasswordDto): Promise<{ success: boolean }> {
    const owner = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (!owner) {
      throw new NotFoundException('ไม่พบผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้');
    }

    const otpRecord = await this.dogOwnerOtpRepository.findOneByDogOwnerIdAndType(
      owner.id,
      OtpType.PASSWORD_RESET,
    );
    if (!otpRecord) {
      throw new BadRequestException(
        'ไม่มี OTP สำหรับรีเซ็ตรหัสผ่าน หรือหมดอายุแล้ว กรุณาขอ OTP ใหม่ที่ forgot-password',
      );
    }
    if (otpRecord.otp !== dto.otp) {
      throw new BadRequestException('OTP ไม่ถูกต้อง');
    }
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP หมดอายุแล้ว กรุณาขอ OTP ใหม่');
    }

    return { success: true };
  }
}
