import { Module } from '@nestjs/common';
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
import { ConfirmReservationUsecase } from './use-cases/confirm-reservation.use-case';
import { GetReservationsUsecase } from './use-cases/get-reservations.use-case';
import { GetReservationDetailUsecase } from './use-cases/get-reservation-detail.use-case';
import { UploadPaymentSlipUsecase } from './use-cases/upload-payment-slip.use-case';
import { VerifyPaymentSlipUsecase } from './use-cases/verify-payment-slip.use-case';
import { RejectPaymentSlipUsecase } from './use-cases/reject-payment-slip.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationLine,
      ReservationStatusLog,
      PaymentSlip,
    ]),
    UserModule,
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    ReservationRepository,
    PaymentSlipRepository,
    ReservationStatusLogRepository,
    ConfirmReservationUsecase,
    GetReservationsUsecase,
    GetReservationDetailUsecase,
    UploadPaymentSlipUsecase,
    VerifyPaymentSlipUsecase,
    RejectPaymentSlipUsecase,
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
