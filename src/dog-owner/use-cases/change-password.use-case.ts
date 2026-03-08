import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DogOwnerRepository } from '../dog-owner.repository';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(
    dogOwnerId: number,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean }> {
    const owner = await this.dogOwnerRepository.findById(dogOwnerId);
    if (!owner) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, owner.password);
    if (!isMatch) {
      throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.dogOwnerRepository.updatePassword(owner, hashedPassword);

    return { success: true };
  }
}
