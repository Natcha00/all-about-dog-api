import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { DogOwnerRepository } from '../dog-owner.repository';
import { DogOwnerOtpRepository } from '../dog-owner-otp.repository';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { generateOtp, getOtpExpiresAt, OTP_EXPIRY_MINUTES } from '../utils/otp.util';
import { OtpType } from '../enums/otp-type.enum';

@Injectable()
export class ForgotPasswordUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly dogOwnerOtpRepository: DogOwnerOtpRepository,
    private readonly mailerService: MailerService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ success: boolean }> {
    const owner = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (!owner) {
      throw new NotFoundException('ไม่พบผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้');
    }

    const otp = generateOtp();
    let otpRecord = await this.dogOwnerOtpRepository.findOneByDogOwnerIdAndType(
      owner.id,
      OtpType.PASSWORD_RESET,
    );
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.expiresAt = getOtpExpiresAt();
      await this.dogOwnerOtpRepository.save(otpRecord);
    } else {
      otpRecord = this.dogOwnerOtpRepository.create({
        dogOwner: owner,
        type: OtpType.PASSWORD_RESET,
        otp,
        expiresAt: getOtpExpiresAt(),
      });
      await this.dogOwnerOtpRepository.save(otpRecord);
    }

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'OTP สำหรับรีเซ็ตรหัสผ่าน',
      text: `รหัส OTP สำหรับรีเซ็ตรหัสผ่านของคุณคือ ${otp} ใช้ได้ภายใน ${OTP_EXPIRY_MINUTES} นาที`,
    });

    return { success: true };
  }
}
