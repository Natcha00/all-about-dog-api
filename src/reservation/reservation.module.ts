import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ReservationRepository } from './reservation.repository';
import { Reservation } from './entities/reservation.entity';
import { ReservationLine } from './entities/reservation-line.entity';
import { UserModule } from 'src/user/user.module';
import { ConfirmReservationUsecase } from './use-cases/confirm-reservation.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationLine]),
    UserModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository, ConfirmReservationUsecase],
  exports: [ReservationService],
})
export class ReservationModule {}
