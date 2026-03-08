import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { UpdateStaffDto } from './dtos/update-staff.dto';
import { StaffLoginRequest } from './dtos/login.dto';
import { StaffProfileDto } from './dtos/profile.dto';
import { ChangeStaffPasswordDto } from './dtos/change-staff-password.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { StaffGuard } from './guards/staff.guard';
import { AdminGuard } from './guards/admin.guard';
import { StaffDecorator } from './decorators/staff.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { CreateStaffUsecase } from './use-cases/create-staff.use-case';
import { LoginStaffUsecase } from './use-cases/login-staff.use-case';
import { GetStaffProfileUsecase } from './use-cases/get-staff-profile.use-case';
import { GetAllStaffUsecase } from './use-cases/get-all-staff.use-case';
import { UpdateStaffUsecase } from './use-cases/update-staff.use-case';
import { DeleteStaffUsecase } from './use-cases/delete-staff.use-case';
import { ChangeStaffPasswordUsecase } from './use-cases/change-staff-password.use-case';
import { ROLE } from 'src/user/enums/role.enum';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly createStaffUsecase: CreateStaffUsecase,
    private readonly loginStaffUsecase: LoginStaffUsecase,
    private readonly getStaffProfileUsecase: GetStaffProfileUsecase,
    private readonly getAllStaffUsecase: GetAllStaffUsecase,
    private readonly updateStaffUsecase: UpdateStaffUsecase,
    private readonly deleteStaffUsecase: DeleteStaffUsecase,
    private readonly changeStaffPasswordUsecase: ChangeStaffPasswordUsecase,
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

  @Patch('profile/password')
  @UseGuards(AccessTokenGuard)
  async changePassword(
    @StaffDecorator() user: IUser,
    @Body() body: ChangeStaffPasswordDto,
  ): Promise<void> {
    return this.changeStaffPasswordUsecase.execute(user.id, body);
  }

  @Get('all')
  @UseGuards(AccessTokenGuard, AdminGuard)
  async getAllStaff(): Promise<StaffProfileDto[]> {
    return this.getAllStaffUsecase.execute();
  }

  @Get('profile/:id')
  @UseGuards(AccessTokenGuard, AdminGuard)
  async getStaffProfileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StaffProfileDto> {
    return this.getStaffProfileUsecase.execute(id);
  }

  @Put('profile/:id')
  @UseGuards(AccessTokenGuard, AdminGuard)
  async updateStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStaffDto,
  ): Promise<{ id: number }> {
    return this.updateStaffUsecase.execute(id, body);
  }

  @Delete('profile/:id')
  @UseGuards(AccessTokenGuard, AdminGuard)
  async deleteStaff(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deleteStaffUsecase.execute(id);
  }

  @Get('admin/menu')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async adminProfile(@StaffDecorator() user: IUser): Promise<boolean> {
    return user.role === ROLE.ADMIN;
  }
}
