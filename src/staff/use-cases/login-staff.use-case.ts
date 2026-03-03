import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StaffRepository } from '../staff.repository';
import { StaffLoginRequest } from '../dtos/login.dto';
import { UserService } from 'src/user/user.service';
import { ROLE } from 'src/user/enums/role.enum';

@Injectable()
export class LoginStaffUsecase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly userService: UserService,
  ) {}

  async execute(
    request: StaffLoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const staff = await this.staffRepository.findOneByEmail(request.email);
    if (!staff) {
      throw new BadRequestException('Email or password incorrect');
    }
    const isMatch = await bcrypt.compare(request.password, staff.password);
    if (!isMatch) {
      throw new BadRequestException('Email or password incorrect');
    }
    const payload = { id: staff.id, role: ROLE.STAFF };
    const accessToken = await this.userService.signAccessToken(payload);
    const refreshToken = await this.userService.signRefreshToken(payload);
    return { accessToken, refreshToken };
  }
}
