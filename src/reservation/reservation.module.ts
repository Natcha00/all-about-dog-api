import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ReservationRepository } from './reservation.repository';
import { Reservation } from './entities/reservation.entity';
import { ReservationLine } from './entities/reservation-line.entity';
import { ReservationStatusLog } from './entities/reservation-status-log.entity';
import { PaymentSlip } from './entities/payment-slip.entity';
import { PaymentSlipRepository } from './payment-slip.repository';
import { ReservationStatusLogRepository } from './reservation-status-log.repository';
import { UserModule } from 'src/user/user.module';
import { DogModule } from 'src/dog/dog.module';
import { StaffModule } from 'src/staff/staff.module';
import { DogOwnerModule } from 'src/dog-owner/dog-owner.module';
import { OfferingModule } from 'src/offering/offering.module';
import { CreateReservationUsecase } from './use-cases/create-reservation.use-case';
import { GetReservationsUsecase } from './use-cases/get-reservations.use-case';
import { GetReservationDetailUsecase } from './use-cases/get-reservation-detail.use-case';
import { UploadPaymentSlipUsecase } from './use-cases/upload-payment-slip.use-case';
import { VerifyPaymentSlipUsecase } from './use-cases/verify-payment-slip.use-case';
import { RejectPaymentSlipUsecase } from './use-cases/reject-payment-slip.use-case';
import { ApproveReservationUsecase } from './use-cases/approve-reservation.use-case';
import { CheckInReservationUsecase } from './use-cases/checkin-reservation.use-case';
import { CheckOutReservationUsecase } from './use-cases/checkout-reservation.use-case';
import { SearchReservationsUsecase } from './use-cases/search-reservations.use-case';
import { CancelReservationUsecase } from './use-cases/cancel-reservation.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationLine,
      ReservationStatusLog,
      PaymentSlip,
    ]),
    UserModule,
    forwardRef(() => DogModule),
    StaffModule,
    DogOwnerModule,
    forwardRef(() => OfferingModule),
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    ReservationRepository,
    PaymentSlipRepository,
    ReservationStatusLogRepository,
    ApproveReservationUsecase,
    CreateReservationUsecase,
    GetReservationsUsecase,
    GetReservationDetailUsecase,
    UploadPaymentSlipUsecase,
    VerifyPaymentSlipUsecase,
    RejectPaymentSlipUsecase,
    SearchReservationsUsecase,
    CheckInReservationUsecase,
    CheckOutReservationUsecase,
    CancelReservationUsecase,
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
