import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Injectable()
export class CheckInReservationUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
  ) {}

  async execute(code: string, staffId: number): Promise<{ success: boolean }> {
    const reservation = await this.reservationRepository.findOneByCode(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.SLIP_VERIFIED) {
      throw new BadRequestException(
        'เช็คอินได้เฉพาะการจองที่ยืนยันการชำระเงินแล้วเท่านั้น',
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

    return { success: true };
  }
}
