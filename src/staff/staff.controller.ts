import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { StaffLoginRequest } from './dtos/login.dto';
import { StaffProfileDto } from './dtos/profile.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { StaffGuard } from './guards/staff.guard';
import { StaffDecorator } from './decorators/staff.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { CreateStaffUsecase } from './use-cases/create-staff.use-case';
import { LoginStaffUsecase } from './use-cases/login-staff.use-case';
import { GetStaffProfileUsecase } from './use-cases/get-staff-profile.use-case';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly createStaffUsecase: CreateStaffUsecase,
    private readonly loginStaffUsecase: LoginStaffUsecase,
    private readonly getStaffProfileUsecase: GetStaffProfileUsecase,
  ) {}

  @Post('createStaff')
  async createStaff(@Body() body: CreateStaffDto): Promise<{ id: number }> {
    return this.createStaffUsecase.execute(body);
  }

  @Post('login')
  async login(
    @Body() body: StaffLoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.loginStaffUsecase.execute(body);
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async profile(@StaffDecorator() user: IUser): Promise<StaffProfileDto> {
    return this.getStaffProfileUsecase.execute(user.id);
  }
}
