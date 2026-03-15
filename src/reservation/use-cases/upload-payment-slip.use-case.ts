import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { PaymentSlipRepository } from '../payment-slip.repository';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { ReservationNotificationService } from '../reservation-notification.service';
import { DoSpacesService } from 'src/storage/do-spaces.service';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadPaymentSlipUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly paymentSlipRepository: PaymentSlipRepository,
    private readonly statusLogRepository: ReservationStatusLogRepository,
    private readonly reservationNotificationService: ReservationNotificationService,
    private readonly doSpacesService: DoSpacesService,
  ) {}

  async execute(
    code: string,
    dogOwnerId: number,
    performedByUserId: number,
    performedByStaff: boolean,
    file: Express.Multer.File,
  ): Promise<{ slipUrl: string }> {
    const reservation =
      await this.reservationRepository.findOneByCodeAndDogOwnerId(
        code,
        dogOwnerId,
      );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    if (reservation.status !== ReservationStatusEnum.WAITING_SLIP && reservation.status !== ReservationStatusEnum.SLIP_UPLOADED) {
      throw new BadRequestException(
        'สามารถแนบสลิปได้เฉพาะการจองที่อยู่ในสถานะรออัปโหลดสลิปหรือรอตรวจสอบสลิปเท่านั้น',
      );
    }

    if (!file?.buffer) {
      throw new BadRequestException('ไม่พบไฟล์รูปภาพ');
    }
    const mime = file.mimetype?.toLowerCase();
    if (!mime || !ALLOWED_MIMES.includes(mime)) {
      throw new BadRequestException(`รองรับเฉพาะไฟล์รูปภาพ (jpeg, png, webp)`);
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('ขนาดไฟล์ไม่เกิน 5 MB');
    }

    const ext =
      mime === 'image/jpeg' || mime === 'image/jpg'
        ? 'jpg'
        : (mime.split('/')[1] ?? 'jpg');
    const safeCode = code.replace(/[^a-zA-Z0-9-]/g, '_');
    const key = `slips/${safeCode}/${Date.now()}.${ext}`;

    const slipUrl = await this.doSpacesService.upload(key, file.buffer, mime);

    if (reservation.paymentSlip) {
      reservation.paymentSlip.slipUrl = slipUrl;
      reservation.paymentSlip.updateBy = String(performedByUserId);
      if (performedByStaff) {
        reservation.paymentSlip.isApproved = true;
        reservation.paymentSlip.approveBy = String(performedByUserId);
      }
    } else {
      const slip = this.paymentSlipRepository.create({
        slipUrl,
        isApproved: performedByStaff,
        approveBy: performedByStaff ? String(performedByUserId) : null,
        updateBy: String(performedByUserId),
        rejectedReason: null,
      });
      slip.reservation = reservation;
      reservation.paymentSlip = slip;
    }

    const finalStatus = performedByStaff
      ? ReservationStatusEnum.SLIP_VERIFIED
      : ReservationStatusEnum.SLIP_UPLOADED;
    reservation.status = finalStatus;
    await this.reservationRepository.saveReservation(reservation);

    const uploadLabel = performedByStaff
      ? 'อัปโหลดสลิปแล้ว โดยพนักงาน'
      : 'อัปโหลดสลิปแล้ว โดยลูกค้า';
    const actorRole = performedByStaff ? 'STAFF' : 'DOG_OWNER';

    await this.statusLogRepository.createAndSave(
      String(reservation.id),
      ReservationStatusEnum.SLIP_UPLOADED,
      String(performedByUserId),
      uploadLabel,
      actorRole,
    );

    if (performedByStaff) {
      await this.statusLogRepository.createAndSave(
        String(reservation.id),
        ReservationStatusEnum.SLIP_VERIFIED,
        String(performedByUserId),
        'ยืนยันการชำระเงินโดยพนักงาน',
        'STAFF',
      );
    }

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      reservation.code,
      finalStatus,
    );

    return { slipUrl };
  }
}
