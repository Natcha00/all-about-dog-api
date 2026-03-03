import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Injectable()
export class CancelReservationUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
  ) {}

  async execute(code: string, dogOwnerId: number): Promise<{ success: boolean }> {
    const reservation = await this.reservationRepository.findOneByCodeAndDogOwnerId(
      code,
      dogOwnerId,
    );
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException(
        'ยกเลิกได้เฉพาะการจองที่อยู่ในสถานะรอการยืนยันเท่านั้น',
      );
    }

    reservation.status = ReservationStatusEnum.CANCELLED;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.CANCELLED,
      String(dogOwnerId),
      'ยกเลิกการจองโดยลูกค้า',
    );

    return { success: true };
  }
}
