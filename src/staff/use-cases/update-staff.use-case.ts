import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StaffRepository } from '../staff.repository';
import { UpdateStaffDto } from '../dtos/update-staff.dto';

@Injectable()
export class UpdateStaffUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(id: number, dto: UpdateStaffDto): Promise<{ id: number }> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (dto.username != null && dto.username !== staff.username) {
      const existingByUsername = await this.staffRepository.findOneByUsername(dto.username);
      if (existingByUsername) {
        throw new BadRequestException('Staff with this username already exists');
      }
      staff.username = dto.username;
    }

    if (dto.email !== undefined) {
      const emailValue = dto.email ?? null;
      if (emailValue && emailValue !== staff.email) {
        const existingByEmail = await this.staffRepository.findOneByEmail(emailValue);
        if (existingByEmail) {
          throw new BadRequestException('Staff with this email already exists');
        }
      }
      staff.email = emailValue;
    }

    if (dto.firstName != null) staff.firstName = dto.firstName;
    if (dto.lastName != null) staff.lastName = dto.lastName;
    if (dto.phoneNumber !== undefined) staff.phoneNumber = dto.phoneNumber ?? null;
    if (dto.role != null) staff.role = dto.role;

    if (dto.password) {
      staff.password = await bcrypt.hash(dto.password, 10);
    }

    await this.staffRepository.save(staff);
    return { id: staff.id };
  }
}
