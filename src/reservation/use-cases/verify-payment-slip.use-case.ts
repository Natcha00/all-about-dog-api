import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { PaymentSlipRepository } from '../payment-slip.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationNotificationService } from '../reservation-notification.service';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { ReservationService } from '../reservation.service';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

@Injectable()
export class VerifyPaymentSlipUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly paymentSlipRepository: PaymentSlipRepository,
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

      /** ฝากเลี้ยง: check slot/ห้องก่อนยืนยันสลิป — กันจองเกินความจุช่วงวันที่ */
    if (reservation.offeringType === OfferingType.BOARDING) {
      await this.reservationService.assertBoardingReservationFits(reservation);
    }

    reservation.status = ReservationStatusEnum.SLIP_VERIFIED;
    await this.reservationRepository.saveReservation(reservation);

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.SLIP_VERIFIED,
      String(staffId),
      'ยืนยันการชำระเงินโดยพนักงาน',
      'STAFF',
    );

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      reservation.code,
      ReservationStatusEnum.SLIP_VERIFIED,
    );

    return { success: true };
  }
}
