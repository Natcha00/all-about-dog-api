import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationNotificationService } from '../reservation-notification.service';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

@Injectable()
export class SelectPaymentMethodUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {}

  async execute(
    code: string,
    method: PaymentMethodEnum,
    dogOwnerId: number,
    performedByUserId: number,
    performedByStaff: boolean,
  ): Promise<{ success: boolean }> {
    const reservation =
      await this.reservationRepository.findOneByCodeAndDogOwnerId(
        code,
        dogOwnerId,
      );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatusEnum.WAITING_SLIP) {
      throw new BadRequestException(
        'สามารถเลือกวิธีชำระเงินได้เฉพาะการจองที่อยู่ในสถานะรออัปโหลดสลิปเท่านั้น',
      );
    }

    if (method === PaymentMethodEnum.SLIP) {
      return { success: true };
    }

    reservation.status = ReservationStatusEnum.SLIP_VERIFIED;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.SLIP_VERIFIED,
      String(performedByUserId),
      'เลือกชำระเงินสดหน้างาน',
      performedByStaff ? 'STAFF' : 'DOG_OWNER',
    );

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      reservation.code,
      ReservationStatusEnum.SLIP_VERIFIED,
    );

    return { success: true };
  }
}
