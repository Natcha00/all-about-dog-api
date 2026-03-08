import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StaffRepository } from '../staff.repository';
import { CreateStaffDto } from '../dtos/create-staff.dto';

@Injectable()
export class CreateStaffUsecase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(dto: CreateStaffDto): Promise<{ id: number }> {
    const existingByUsername = await this.staffRepository.findOneByUsername(dto.username);
    if (existingByUsername) {
      throw new BadRequestException('Staff with this username already exists');
    }
    if (dto.email) {
      const existingByEmail = await this.staffRepository.findOneByEmail(dto.email);
      if (existingByEmail) {
        throw new BadRequestException('Staff with this email already exists');
      }
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const staff = this.staffRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      email: dto.email ?? null,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber ?? null,
      role: dto.role,
    });
    const saved = await this.staffRepository.save(staff);
    return { id: saved.id };
  }
}
