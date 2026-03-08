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
import { UpdateStaffUsecase } from './use-cases/update-staff.use-case';
import { DeleteStaffUsecase } from './use-cases/delete-staff.use-case';

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
    UpdateStaffUsecase,
    DeleteStaffUsecase,
  ],
  exports: [StaffGuard, AdminGuard, StaffRepository],
})
export class StaffModule {}
