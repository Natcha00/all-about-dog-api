import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StaffRepository } from '../staff.repository';
import { CreateStaffDto } from '../dtos/create-staff.dto';

@Injectable()
export class CreateStaffUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(dto: CreateStaffDto): Promise<{ id: number }> {
    const existing = await this.staffRepository.findOneByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Staff with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const staff = this.staffRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber ?? undefined,
    });
    const saved = await this.staffRepository.save(staff);
    return { id: saved.id };
  }
}
