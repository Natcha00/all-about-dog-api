import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';
import { VerifyEmailOtpDto } from '../dtos/verify-email-otp.dto';

@Injectable()
export class VerifyEmailOtpUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(dto: VerifyEmailOtpDto): Promise<{ success: boolean }> {
    const owner = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (!owner) {
      throw new NotFoundException('ไม่พบผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้');
    }
    if (owner.isEmailVerified) {
      return { success: true };
    }
    if (!owner.emailVerificationOtp || !owner.emailVerificationOtpExpiresAt) {
      throw new BadRequestException('ไม่มี OTP สำหรับอีเมลนี้ หรือหมดอายุแล้ว กรุณาลงทะเบียนใหม่หรือขอ OTP ใหม่');
    }
    if (owner.emailVerificationOtp !== dto.otp) {
      throw new BadRequestException('OTP ไม่ถูกต้อง');
    }
    if (new Date() > owner.emailVerificationOtpExpiresAt) {
      throw new BadRequestException('OTP หมดอายุแล้ว กรุณาขอ OTP ใหม่');
    }

    owner.isEmailVerified = true;
    owner.emailVerificationOtp = null;
    owner.emailVerificationOtpExpiresAt = null;
    await this.dogOwnerRepository.insert(owner);

    return { success: true };
  }
}
