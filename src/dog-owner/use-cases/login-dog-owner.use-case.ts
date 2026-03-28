import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DogOwnerRepository } from '../dog-owner.repository';
import { LoginRequest } from '../dtos/login.dto';
import { UserService } from 'src/user/user.service';
import { ROLE } from 'src/user/enums/role.enum';

@Injectable()
export class LoginDogOwnerUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly userService: UserService,
  ) {}

  async execute(
    request: LoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const dogOwner = await  this.dogOwnerRepository.findOneByEmail(
      request.email,
    );
    if (!dogOwner) {
      throw new BadRequestException('Email or password incorrect');
    }
    const isMatch = await bcrypt.compare(request.password, dogOwner.password);
    if (!isMatch) {
      throw new BadRequestException('Email or password incorrect');
    }
    if (!dogOwner.isEmailVerified) {
      throw new UnauthorizedException(
        'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ โปรดตรวจสอบอีเมลและใช้รหัส OTP ที่ส่งให้คุณ',
      );
    }
    const payload = { id: dogOwner.id, role: ROLE.DOG_OWNER };
    const accessToken = await this.userService.signAccessToken(payload);
    const refreshToken = await this.userService.signRefreshToken(payload);
    return { accessToken, refreshToken };
  }
}
