import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { DogOwnerRepository } from '../dog-owner.repository';
import { RegisterDto } from '../dtos/register.dto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

@Injectable()
export class RegisterDogOwnerUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly mailerService: MailerService,
  ) {}

  async execute(dto: RegisterDto): Promise<void> {
    const existing = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (existing) {
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
    const saved = await this.dogOwnerRepository.insert(dogOwner);

    const otp = generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    saved.emailVerificationOtp = otp;
    saved.emailVerificationOtpExpiresAt = expiresAt;
    await this.dogOwnerRepository.insert(saved);

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'OTP Code',
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
  }
}
