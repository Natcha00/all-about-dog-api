import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { PaymentSlipRepository } from '../payment-slip.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Injectable()
export class VerifyPaymentSlipUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly paymentSlipRepository: PaymentSlipRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
  ) {}

  async execute(code: string, staffId: number): Promise<{ success: boolean }> {
    const reservation = await this.reservationRepository.findOneByCode(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.SLIP_UPLOADED) {
      throw new BadRequestException(
        'ยืนยันสลิปได้เฉพาะการจองที่อยู่ในสถานะรอตรวจสลิปเท่านั้น',
      );
    }
    const slip = await this.paymentSlipRepository.findByReservationId(
      String(reservation.id),
    );
    if (!slip) {
      throw new BadRequestException('ไม่พบสลิปการชำระเงิน');
    }

    slip.isApproved = true;
    slip.approveBy = String(staffId);
    slip.updateBy = String(staffId);
    await this.paymentSlipRepository.save(slip);

    reservation.status = ReservationStatusEnum.SLIP_VERIFIED;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.SLIP_VERIFIED,
      String(staffId),
      'ยืนยันการชำระเงินโดยพนักงาน',
    );

    return { success: true };
  }
}
