import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailerSendMailService } from 'src/mail/mailersend-mail.service';
import { DogOwnerRepository } from '../dog-owner.repository';
import { DogOwnerOtpRepository } from '../dog-owner-otp.repository';
import { ResendVerifyOtpDto } from '../dtos/resend-verify-otp.dto';
import { generateOtp, getOtpExpiresAt, OTP_EXPIRY_MINUTES } from '../utils/otp.util';
import { OtpType } from '../enums/otp-type.enum';

@Injectable()
export class ResendVerifyOtpUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly dogOwnerOtpRepository: DogOwnerOtpRepository,
    private readonly mailerService: MailerSendMailService,
  ) {}

  async execute(dto: ResendVerifyOtpDto): Promise<{ success: boolean }> {
    const owner = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (!owner) {
      throw new NotFoundException('ไม่พบผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้');
    }
    if (owner.isEmailVerified) {
      throw new BadRequestException('อีเมลนี้ยืนยันแล้ว ไม่จำเป็นต้องขอ OTP ใหม่');
    }

    const otp = generateOtp();
    let otpRecord = await this.dogOwnerOtpRepository.findOneByDogOwnerIdAndType(
      owner.id,
      OtpType.EMAIL_VERIFICATION,
    );
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.expiresAt = getOtpExpiresAt();
      await this.dogOwnerOtpRepository.save(otpRecord);
    } else {
      otpRecord = this.dogOwnerOtpRepository.create({
        dogOwner: owner,
        type: OtpType.EMAIL_VERIFICATION,
        otp,
        expiresAt: getOtpExpiresAt(),
      });
      await this.dogOwnerOtpRepository.save(otpRecord);
    }

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'OTP Code (ยืนยันอีเมล)',
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    return { success: true };
  }
}
