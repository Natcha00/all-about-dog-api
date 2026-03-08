import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StaffRepository } from '../staff.repository';
import { ChangeStaffPasswordDto } from '../dtos/change-staff-password.dto';

@Injectable()
export class ChangeStaffPasswordUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(id: number, dto: ChangeStaffPasswordDto): Promise<void> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const isOldPasswordCorrect = await bcrypt.compare(dto.oldPassword, staff.password);
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('รหัสผ่านเดิมไม่ถูกต้อง');
    }

    staff.password = await bcrypt.hash(dto.newPassword, 10);
    await this.staffRepository.save(staff);
  }
}
