import { Injectable } from '@nestjs/common';
import { StaffRepository } from '../staff.repository';
import { StaffProfileDto } from '../dtos/profile.dto';
import { ROLE } from 'src/user/enums/role.enum';

@Injectable()
export class GetAllStaffUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(): Promise<StaffProfileDto[]> {
    const staffList = await this.staffRepository.findAll();
    return staffList.map((staff) => ({
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phoneNumber: staff.phoneNumber,
      username: staff.username,
      role: staff.role as ROLE,
    }));
  }
}
