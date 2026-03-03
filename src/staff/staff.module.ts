import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { StaffGuard } from './guards/staff.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff]),
    UserModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository, StaffGuard],
  exports: [StaffService, StaffGuard],
})
export class StaffModule {}
