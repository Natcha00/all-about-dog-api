import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../staff.repository';
import { StaffProfileDto } from '../dtos/profile.dto';
import { ROLE } from 'src/user/enums/role.enum';

@Injectable()
export class GetStaffProfileUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(staffId: number): Promise<StaffProfileDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return {
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phoneNumber: staff.phoneNumber,
      username: staff.username,
      role: staff.role as ROLE,

    };
  }
}
