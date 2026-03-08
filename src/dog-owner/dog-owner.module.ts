import { Module } from '@nestjs/common';
import { DogOwnerController } from './dog-owner.controller';
import { DogOwnerRepository } from './dog-owner.repository';
import { DogOwner } from './entities/dog-owner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { StaffModule } from 'src/staff/staff.module';
import { CreateDogOwnerUsecase } from './use-cases/create-dog-owner.use-case';
import { RegisterDogOwnerUsecase } from './use-cases/register-dog-owner.use-case';
import { VerifyEmailOtpUsecase } from './use-cases/verify-email-otp.use-case';
import { LoginDogOwnerUsecase } from './use-cases/login-dog-owner.use-case';
import { GetAllDogOwnersUsecase } from './use-cases/get-all-dog-owners.use-case';
import { SearchDogOwnerUsecase } from './use-cases/search-dog-owner.use-case';
import { GetDogOwnerByIdUsecase } from './use-cases/get-dog-owner-by-id.use-case';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DogOwner]),
    UserModule,
    StaffModule,
    MailModule,
  ],
  controllers: [DogOwnerController],
  providers: [
    DogOwnerRepository,
    CreateDogOwnerUsecase,
    RegisterDogOwnerUsecase,
    VerifyEmailOtpUsecase,
    LoginDogOwnerUsecase,
    GetAllDogOwnersUsecase,
    SearchDogOwnerUsecase,
    GetDogOwnerByIdUsecase,
  ],
  exports: [GetDogOwnerByIdUsecase, DogOwnerRepository],
})
export class DogOwnerModule {}
