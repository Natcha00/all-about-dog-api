import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailerSendMailService } from 'src/mail/mailersend-mail.service';
import { DogOwnerRepository } from '../dog-owner.repository';
import { DogOwnerOtpRepository } from '../dog-owner-otp.repository';
import { RegisterDto } from '../dtos/register.dto';
import { generateOtp, getOtpExpiresAt, OTP_EXPIRY_MINUTES } from '../utils/otp.util';
import { OtpType } from '../enums/otp-type.enum';

@Injectable()
export class RegisterDogOwnerUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly dogOwnerOtpRepository: DogOwnerOtpRepository,
    private readonly mailerService: MailerSendMailService,
  ) {}

  async execute(dto: RegisterDto): Promise<void> {
    const existing = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (existing?.isEmailVerified) {
      throw new BadRequestException('Dog Owner already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const code = `DO-${Date.now().toString(36).toUpperCase()}`;
    const dogOwner = this.dogOwnerRepository.initiate({
      code,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber,
      address: dto.address ?? undefined,
      profilePictureUrl: dto.profilePictureUrl ?? undefined,
      isEmailVerified: false,
    });
    
    if(existing) {
      dogOwner.id = existing.id;
    }
    const saved = await this.dogOwnerRepository.insert(dogOwner);

    const otp = generateOtp();
    const otpRecord = this.dogOwnerOtpRepository.create({
      dogOwner: saved,
      type: OtpType.EMAIL_VERIFICATION,
      otp,
      expiresAt: getOtpExpiresAt(),
    });
    await this.dogOwnerOtpRepository.save(otpRecord);

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'OTP Code',
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
  }
}
