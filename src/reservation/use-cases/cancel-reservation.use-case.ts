import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reservation } from '../entities/reservation.entity';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Injectable()
export class CancelReservationUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
  ) {}

  async execute(
    code: string,
    dogOwnerId: number,
    performedByStaff: boolean,
    cancelReason?: string,
  ): Promise<{ success: boolean }> {
    if (performedByStaff) {
      const reason = cancelReason?.trim();
      if (!reason) {
        throw new BadRequestException(
          'กรุณาระบุหมายเหตุเหตุผลที่ยกเลิกเมื่อยกเลิกโดยพนักงาน',
        );
      }
    }

    let reservation: Reservation | null;

    if (performedByStaff) {
      reservation = await this.reservationRepository.findOneByCodeAndDogOwnerId(
        code,
        dogOwnerId,
      );
      if (!reservation) {
        throw new NotFoundException('ไม่พบการจอง');
      }
      // staff สามารถยกเลิกได้ทุกสถานะ (ไม่เช็ค PENDING)
    } else {
      reservation = await this.reservationRepository.findOneByCodeAndDogOwnerId(
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
    }

    reservation.status = ReservationStatusEnum.CANCELLED;
    await this.reservationRepository.saveReservation(reservation);

    const label = performedByStaff
      ? `ยกเลิกการจองโดยพนักงาน: ${cancelReason!.trim()}`
      : 'ยกเลิกการจองโดยลูกค้า';
    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.CANCELLED,
      String(dogOwnerId),
      label,
    );

    return { success: true };
  }
}
