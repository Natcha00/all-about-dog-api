import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StaffRepository } from './staff.repository';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { StaffLoginRequest } from './dtos/login.dto';
import { UserService } from 'src/user/user.service';
import { ROLE } from 'src/user/enums/role.enum';
import { StaffProfileDto } from './dtos/profile.dto';

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly userService: UserService,
  ) {}

  async createStaff(dto: CreateStaffDto): Promise<{ id: number }> {
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
      phoneNumber: dto.phoneNumber ?? null,
    });
    const saved = await this.staffRepository.save(staff);
    return { id: saved.id };
  }

  async login(request: StaffLoginRequest): Promise<{ accessToken: string; refreshToken: string }> {
    const staff = await this.staffRepository.findOneByEmail(request.email);
    if (!staff) {
      throw new BadRequestException('Email or password incorrect');
    }
    const isMatch = await bcrypt.compare(request.password, staff.password);
    if (!isMatch) {
      throw new BadRequestException('Email or password incorrect');
    }
    const accessToken = await this.userService.signAccessToken({
      id: staff.id,
      role: ROLE.STAFF,
    });
    const refreshToken = await this.userService.signRefreshToken({
      id: staff.id,
      role: ROLE.STAFF,
    });
    return { accessToken, refreshToken };
  }

  async getProfile(staffId: number): Promise<StaffProfileDto> {
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
    };
  }
}
