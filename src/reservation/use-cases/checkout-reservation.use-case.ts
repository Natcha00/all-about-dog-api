import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Injectable()
export class CheckOutReservationUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
  ) {}

  async execute(code: string, staffId: number): Promise<{ success: boolean }> {
    const reservation = await this.reservationRepository.findOneByCode(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.CHECK_IN) {
      throw new BadRequestException(
        'เช็คเอาท์ได้เฉพาะการจองที่อยู่ระหว่างใช้บริการเท่านั้น',
      );
    }

    reservation.status = ReservationStatusEnum.FINISHED;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.FINISHED,
      String(staffId),
      'Check-out แล้ว',
      'STAFF',
    );

    return { success: true };
  }
}
