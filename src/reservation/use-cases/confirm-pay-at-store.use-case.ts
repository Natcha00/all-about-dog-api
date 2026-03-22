import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationNotificationService } from '../reservation-notification.service';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { ReservationService } from '../reservation.service';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

/**
 * ลูกค้าชำระเงินหน้าร้านแล้ว — staff ยืนยันรับเงินและทำ Check-in ในขั้นตอนเดียว (boarding + swimming)
 */
@Injectable()
export class ConfirmPayAtStoreUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
    private readonly reservationNotificationService: ReservationNotificationService,
    private readonly reservationService: ReservationService,
  ) {}

  async execute(code: string, staffId: number): Promise<{ success: boolean }> {
    const reservation =
      await this.reservationRepository.findOneByCodeWithStaffRelations(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.PAY_AT_STORE) {
      throw new BadRequestException(
        'ยืนยันรับเงินหน้าร้านได้เฉพาะการจองที่อยู่ในสถานะรอชำระเงินหน้าร้านเท่านั้น',
      );
    }

    if (reservation.offeringType === OfferingType.BOARDING) {
      await this.reservationService.assertBoardingReservationFits(reservation);
    }

    reservation.status = ReservationStatusEnum.CHECK_IN;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.CHECK_IN,
      String(staffId),
      'ยืนยันรับเงินหน้าร้านและ Check-in',
      'STAFF',
    );

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      reservation.code,
      ReservationStatusEnum.CHECK_IN,
    );

    return { success: true };
  }
}
