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
export class ApproveReservationUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {}

  async execute(code: string, staffId: number): Promise<{ success: boolean }> {
    const reservation = await this.reservationRepository.findOneByCode(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException(
        'สามารถอนุมัติได้เฉพาะการจองที่อยู่ในสถานะรอการยืนยันเท่านั้น',
      );
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

