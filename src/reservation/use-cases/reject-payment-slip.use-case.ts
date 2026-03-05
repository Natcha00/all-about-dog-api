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
export class RejectPaymentSlipUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly paymentSlipRepository: PaymentSlipRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
  ) {}

  async execute(
    code: string,
    staffId: number,
    reason: string,
  ): Promise<{ success: boolean }> {
    const reservation = await this.reservationRepository.findOneByCode(code);
    if (!reservation) {
      throw new NotFoundException('ไม่พบการจอง');
    }
    if (reservation.status !== ReservationStatusEnum.SLIP_UPLOADED) {
      throw new BadRequestException(
        'ปฏิเสธสลิปได้เฉพาะการจองที่อยู่ในสถานะรอตรวจสลิปเท่านั้น',
      );
    }
    console.log(reservation);
    const slip = reservation.paymentSlip;
    if (!slip) {
      throw new BadRequestException('ไม่พบสลิปการชำระเงิน');
    }

    slip.isApproved = false;
    slip.updateBy = String(staffId);
    slip.rejectedReason = reason.trim() || null;
    await this.paymentSlipRepository.save(slip);

    reservation.status = ReservationStatusEnum.WAITING_SLIP;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.WAITING_SLIP,
      String(staffId),
      `ปฏิเสธสลิป: ${reason.trim() || 'ไม่มีเหตุผล'}`,
      'STAFF',
    );

    return { success: true };
  }
}
