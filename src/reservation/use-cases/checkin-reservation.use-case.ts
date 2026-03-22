import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationNotificationService } from '../reservation-notification.service';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Injectable()
export class CheckInReservationUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {}

  /**
   * Check-in หลังชำระด้วยสลิป (slip_verified) เท่านั้น
   * ชำระหน้าร้าน → ใช้ ConfirmPayAtStoreUsecase
   */
  async execute(code: string, staffId: number): Promise<{ success: boolean }> {
    const reservation =
      await this.reservationRepository.findOneByCodeWithStaffRelations(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.SLIP_VERIFIED) {
      throw new BadRequestException(
        'เช็คอินแบบนี้ใช้ได้เฉพาะการจองที่ยืนยันสลิปแล้ว (slip_verified) หากชำระหน้าร้านให้ใช้ยืนยันรับเงินหน้าร้าน',
      );
    }

    reservation.status = ReservationStatusEnum.CHECK_IN;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.CHECK_IN,
      String(staffId),
      'Check-in แล้ว',
      'STAFF',
    );

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      reservation.code,
      ReservationStatusEnum.CHECK_IN,
    );

    return { success: true };
  }
}
