import { Injectable, Logger } from '@nestjs/common';
import { NodemailerMailService } from 'src/mail/nodemailer-mail.service';
import { ReservationRepository } from './reservation.repository';
import { ReservationStatusEnum } from './enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

const STATUS_LABEL: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยัน',
  [ReservationStatusEnum.WAITING_SLIP]: 'รออัปโหลดสลิป',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอตรวจสลิป',
  [ReservationStatusEnum.PAY_AT_STORE]: 'รอชำระเงินหน้าร้าน',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ยืนยันแล้ว',
  [ReservationStatusEnum.CHECK_IN]: 'อยู่ระหว่างใช้บริการ',
  [ReservationStatusEnum.FINISHED]: 'เสร็จสิ้น',
  [ReservationStatusEnum.CANCELLED]: 'ยกเลิก',
};

const NEXT_STEP: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยันจากพนักงาน',
  [ReservationStatusEnum.WAITING_SLIP]: 'กรุณาอัปโหลดสลิปการโอนเงิน',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอพนักงานตรวจสอบสลิป',
  [ReservationStatusEnum.PAY_AT_STORE]:
    'กรุณามาชำระเงินที่ร้านตามเวลานัดหมาย (หรือเช็คอินได้เมื่อชำระแล้วตามนโยบายร้าน)',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'สามารถเช็คอินได้ในวันใช้บริการ',
  [ReservationStatusEnum.CHECK_IN]: 'อยู่ระหว่างใช้บริการ',
  [ReservationStatusEnum.FINISHED]: 'ขอบคุณที่ใช้บริการ',
  [ReservationStatusEnum.CANCELLED]: 'การจองถูกยกเลิกแล้ว',
};

const OFFERING_TYPE_LABEL: Record<OfferingType, string> = {
  [OfferingType.BOARDING]: 'ฝากเลี้ยง',
  [OfferingType.SWIMMING]: 'ว่ายน้ำ',
};

@Injectable()
export class ReservationNotificationService {
  private readonly logger = new Logger(ReservationNotificationService.name);

  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly mailerService: NodemailerMailService,
  ) {}

  /**
   * ส่งอีเมลแจ้งเจ้าของการจองว่าสถานะการจองอัปเดตแล้ว พร้อมรายละเอียดและขั้นตอนถัดไป
   */
  async sendStatusUpdatedEmail(
    code: string,
    status: ReservationStatusEnum,
  ): Promise<void> {
    if (
      status === ReservationStatusEnum.CHECK_IN ||
      status === ReservationStatusEnum.FINISHED
    ) {
      return;
    }
    try {
      const reservation =
        await this.reservationRepository.findOneByCodeWithDogOwner(code);
      if (!reservation?.dogOwner?.email) {
        return;
      }
      const to = reservation.dogOwner.email;
      const owner = reservation.dogOwner;
      const firstName = owner.firstName?.trim() || 'คุณ';
      const lastName = owner.lastName?.trim() || '';
      const ownerName = lastName ? `${firstName} ${lastName}` : firstName;

      const statusLabel = STATUS_LABEL[status] ?? status;
      const nextStep = NEXT_STEP[status] ?? '-';
      const offeringLabel =
        OFFERING_TYPE_LABEL[reservation.offeringType as OfferingType] ??
        reservation.offeringType ??
        'บริการ';

      const lines = reservation.reservationLines ?? [];
      const dogEntries = lines
        .map((line) => line.dog)
        .filter(Boolean)
        .map(
          (dog) =>
            `${dog!.name} (${dog!.breed?.nameTh ?? dog!.breed?.nameEng ?? 'ไม่ระบุพันธุ์'})`,
        );
      const dogList =
        dogEntries.length > 0
          ? dogEntries.join(', ')
          : 'ไม่ระบุรายการสุนัข';

      const subject = `[All About Dog] สถานะการจอง ${code} อัปเดตแล้ว`;
      const text = [
        `เรียน คุณ${ownerName}`,
        '',
        'ทาง All About Dog ขอแจ้งให้ทราบว่าการจองของท่านมีการอัปเดตสถานะแล้ว',
        '',
        `รายการจอง: ${offeringLabel}`,
        `หมายเลขการจอง: ${code}`,
        `สุนัขที่จอง: ${dogList}`,
        '',
        `สถานะปัจจุบัน: ${statusLabel}`,
        `ขั้นตอนถัดไป: ${nextStep}`,
        '',
        'ท่านสามารถตรวจสอบรายละเอียดการจองได้ที่แอปพลิเคชัน',
        '',
        'ขอขอบคุณที่ใช้บริการ All About Dog',
        'ด้วยความเคารพ',
      ].join('\n');

      await this.mailerService.sendMail({ to, subject, text });
    } catch (err) {
      this.logger.warn(
        `Failed to send reservation status email for ${code}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
