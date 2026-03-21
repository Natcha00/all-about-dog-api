import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';

@Injectable()
export class VerifyDogOwnerForMeUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(userId: number): Promise<void> {
    const owner = await this.dogOwnerRepository.findById(userId);
    if (!owner) {
      throw new UnauthorizedException(
        'บัญชีไม่พบในระบบ กรุณาเข้าสู่ระบบใหม่',
      );
    }
    if (owner.email) {
      const byEmail = await this.dogOwnerRepository.findOneByEmail(owner.email);
      if (!byEmail || byEmail.id !== owner.id) {
        throw new UnauthorizedException(
          'บัญชีไม่พบในระบบ กรุณาเข้าสู่ระบบใหม่',
        );
      }
    }
  }
}
