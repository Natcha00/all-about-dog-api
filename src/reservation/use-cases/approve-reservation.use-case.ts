import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationNotificationService } from '../reservation-notification.service';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { ReservationService } from '../reservation.service';

@Injectable()
export class ApproveReservationUsecase {
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
    if (reservation.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException(
        'สามารถอนุมัติได้เฉพาะการจองที่อยู่ในสถานะรอการยืนยันเท่านั้น',
      );
    }

    /** ว่ายน้ำ: รอชำระหน้าร้าน — กันคิว/หักที่สระเมื่อเข้าสถานะ pay_at_store */
    if (reservation.offeringType === OfferingType.SWIMMING) {
      await this.reservationService.assertSwimmingSlotFits(reservation);
      reservation.status = ReservationStatusEnum.PAY_AT_STORE;
      await this.reservationRepository.saveReservation(reservation);

      await this.statusLogRepository.createAndSave(
        String(reservation.id),
        ReservationStatusEnum.PAY_AT_STORE,
        String(staffId),
        'อนุมัติการจองว่ายน้ำ — รอชำระเงินหน้าร้าน',
        'STAFF',
      );

      await this.reservationNotificationService.sendStatusUpdatedEmail(
        reservation.code,
        ReservationStatusEnum.PAY_AT_STORE,
      );

      return { success: true };
    }

    reservation.status = ReservationStatusEnum.WAITING_SLIP;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.WAITING_SLIP,
      String(staffId),
      'อนุมัติการจองแล้ว',
      'STAFF',
    );

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      reservation.code,
      ReservationStatusEnum.WAITING_SLIP,
    );

    return { success: true };
  }
}

