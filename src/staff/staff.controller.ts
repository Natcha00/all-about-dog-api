import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { StaffLoginRequest } from './dtos/login.dto';
import { StaffProfileDto } from './dtos/profile.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { StaffGuard } from './guards/staff.guard';
import { StaffDecorator } from './decorators/staff.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('createStaff')
  async createStaff(@Body() body: CreateStaffDto): Promise<{ id: number }> {
    return this.staffService.createStaff(body);
  }

  @Post('login')
  async login(
    @Body() body: StaffLoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.staffService.login(body);
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async profile(@StaffDecorator() user: IUser): Promise<StaffProfileDto> {
    return this.staffService.getProfile(user.id);
  }
}
