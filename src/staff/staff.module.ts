import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffController } from './staff.controller';
import { StaffRepository } from './staff.repository';
import { StaffGuard } from './guards/staff.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserModule } from 'src/user/user.module';
import { CreateStaffUsecase } from './use-cases/create-staff.use-case';
import { LoginStaffUsecase } from './use-cases/login-staff.use-case';
import { GetStaffProfileUsecase } from './use-cases/get-staff-profile.use-case';
import { GetAllStaffUsecase } from './use-cases/get-all-staff.use-case';
import { UpdateStaffUsecase } from './use-cases/update-staff.use-case';
import { DeleteStaffUsecase } from './use-cases/delete-staff.use-case';
import { ChangeStaffPasswordUsecase } from './use-cases/change-staff-password.use-case';
import { RefreshTokenUsecase } from './use-cases/refresh-token.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff]),
    UserModule,
  ],
  controllers: [StaffController],
  providers: [
    StaffRepository,
    StaffGuard,
    AdminGuard,
    CreateStaffUsecase,
    LoginStaffUsecase,
    GetStaffProfileUsecase,
    GetAllStaffUsecase,
    UpdateStaffUsecase,
    DeleteStaffUsecase,
    ChangeStaffPasswordUsecase,
    RefreshTokenUsecase,
  ],
  exports: [StaffGuard, AdminGuard, StaffRepository],
})
export class StaffModule {}
