import { Module } from '@nestjs/common';
import { DogOwnerController } from './dog-owner.controller';
import { DogOwnerRepository } from './dog-owner.repository';
import { DogOwnerOtpRepository } from './dog-owner-otp.repository';
import { DogOwner } from './entities/dog-owner.entity';
import { DogOwnerOtp } from './entities/dog-owner-otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { StaffModule } from 'src/staff/staff.module';
import { CreateDogOwnerUsecase } from './use-cases/create-dog-owner.use-case';
import { RegisterDogOwnerUsecase } from './use-cases/register-dog-owner.use-case';
import { VerifyEmailOtpUsecase } from './use-cases/verify-email-otp.use-case';
import { ResendVerifyOtpUsecase } from './use-cases/resend-verify-otp.use-case';
import { LoginDogOwnerUsecase } from './use-cases/login-dog-owner.use-case';
import { ForgotPasswordUsecase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUsecase } from './use-cases/reset-password.use-case';
import { VerifyOtpResetPasswordUsecase } from './use-cases/verify-otp-reset-password.use-case';
import { RefreshTokenUsecase } from './use-cases/refresh-token.use-case';
import { GetAllDogOwnersUsecase } from './use-cases/get-all-dog-owners.use-case';
import { SearchDogOwnerUsecase } from './use-cases/search-dog-owner.use-case';
import { GetDogOwnerByIdUsecase } from './use-cases/get-dog-owner-by-id.use-case';
import { GetDogOwnerProfileUsecase } from './use-cases/get-dog-owner-profile.use-case';
import { UpdateDogOwnerProfilePictureUsecase } from './use-cases/update-dog-owner-profile-picture.use-case';
import { UpdateDogOwnerProfileUsecase } from './use-cases/update-dog-owner-profile.use-case';
import { ChangePasswordUsecase } from './use-cases/change-password.use-case';
import { MailModule } from 'src/mail/mail.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DogOwner, DogOwnerOtp]),
    UserModule,
    StaffModule,
    MailModule,
    StorageModule,
  ],
  controllers: [DogOwnerController],
  providers: [
    DogOwnerRepository,
    DogOwnerOtpRepository,
    CreateDogOwnerUsecase,
    RegisterDogOwnerUsecase,
    VerifyEmailOtpUsecase,
    ResendVerifyOtpUsecase,
    LoginDogOwnerUsecase,
    RefreshTokenUsecase,
    ForgotPasswordUsecase,
    ResetPasswordUsecase,
    VerifyOtpResetPasswordUsecase,
    GetAllDogOwnersUsecase,
    SearchDogOwnerUsecase,
    GetDogOwnerByIdUsecase,
    GetDogOwnerProfileUsecase,
    UpdateDogOwnerProfilePictureUsecase,
    UpdateDogOwnerProfileUsecase,
    ChangePasswordUsecase,
  ],
  exports: [GetDogOwnerByIdUsecase, DogOwnerRepository],
})
export class DogOwnerModule {}
