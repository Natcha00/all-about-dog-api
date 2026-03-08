import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../staff.repository';

@Injectable()
export class DeleteStaffUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(id: number): Promise<void> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    await this.staffRepository.delete(id);
  }
}
