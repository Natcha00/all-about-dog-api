import { Injectable, NotFoundException } from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import {
  GetReservationDetailResultResponse,
  GetReservationDetailPackageDto,
  GetReservationDetailPeriodDto,
  GetReservationDetailGroupDto,
  GetReservationDetailPetIdDto,
  GetReservationDetailActionsDto,
  GetReservationDetailSlipDto,
  GetReservationDetailTimelineItemDto,
} from '../dtos/get-reservation-detail.dto';

const STATUS_LABELS: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยัน',
  [ReservationStatusEnum.WAITING_SLIP]: 'รออัปโหลดสลิป',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอตรวจสลิป',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ยืนยันแล้ว',
  [ReservationStatusEnum.CHECK_IN]: 'อยู่ระหว่างใช้บริการ',
  [ReservationStatusEnum.FINISHED]: 'เสร็จสิ้น',
  [ReservationStatusEnum.CANCELLED]: 'ยกเลิก',
};

const STATUS_HINTS: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยันจากระบบ',
  [ReservationStatusEnum.WAITING_SLIP]: 'แนบสลิปเพื่อให้พนักงานตรวจสอบ',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอพนักงานตรวจสอบสลิป',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ชำระเงินเรียบร้อย',
  [ReservationStatusEnum.CHECK_IN]: 'สามารถเช็คอินได้',
  [ReservationStatusEnum.FINISHED]: 'จบการใช้บริการ',
  [ReservationStatusEnum.CANCELLED]: 'การจองถูกยกเลิก',
};

const STATUS_TONE: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'warning',
  [ReservationStatusEnum.WAITING_SLIP]: 'warning',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'warning',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'success',
  [ReservationStatusEnum.CHECK_IN]: 'info',
  [ReservationStatusEnum.FINISHED]: 'success',
  [ReservationStatusEnum.CANCELLED]: 'error',
};

const SERVICE_LABELS: Record<OfferingType, string> = {
  [OfferingType.BOARDING]: 'ฝากเลี้ยง',
  [OfferingType.SWIMMING]: 'ว่ายน้ำ',
};

const TIMELINE_STEPS: { key: ReservationStatusEnum; label: string }[] = [
  { key: ReservationStatusEnum.PENDING, label: 'สร้างรายการจอง' },
  { key: ReservationStatusEnum.WAITING_SLIP, label: 'รอชำระเงิน' },
  { key: ReservationStatusEnum.SLIP_UPLOADED, label: 'อัปโหลดสลิปแล้ว' },
  { key: ReservationStatusEnum.SLIP_VERIFIED, label: 'ยืนยันการชำระเงินโดยพนักงาน' },
  { key: ReservationStatusEnum.CHECK_IN, label: 'Check-in' },
  { key: ReservationStatusEnum.FINISHED, label: 'จบการใช้บริการ' },
  { key: ReservationStatusEnum.CANCELLED, label: 'ยกเลิกการจอง' },
];

@Injectable()
export class GetReservationDetailUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(
    code: string,
    dogOwnerId: number,
  ): Promise<GetReservationDetailResultResponse> {
    const reservation = await this.reservationRepository.findOneByCodeAndDogOwnerId(
      code,
      dogOwnerId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return this.toDetailResult(reservation);
  }

  private toDetailResult(r: Reservation): GetReservationDetailResultResponse {
    const start = new Date(r.startDateTime);
    const end = new Date(r.endDateTime);
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
    const toTimeStr = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const totalPrice = (r.reservationLines ?? []).reduce(
      (sum, line) => sum + (line.price ?? 0) * (line.quantity ?? 1),
      0,
    );

    const groups = this.buildGroups(r);
    const timeline = this.buildTimeline(r);
    const packageDto: GetReservationDetailPackageDto = {
      code: 'standard',
      label: 'แบบมาตรฐาน',
    };
    const period: GetReservationDetailPeriodDto =
      r.offeringType === OfferingType.SWIMMING
        ? { start: toTimeStr(start), end: toTimeStr(end) }
        : { start: toDateStr(start), end: toDateStr(end) };
    const slip = this.buildSlip(r);
    const actions = this.buildActions(r);

    return {
      bookingCode: r.code,
      status: r.status,
      statusLabel: STATUS_LABELS[r.status] ?? r.status,
      statusHint: STATUS_HINTS[r.status] ?? '',
      statusTone: STATUS_TONE[r.status] ?? 'info',
      serviceType: r.offeringType,
      serviceLabel: SERVICE_LABELS[r.offeringType] ?? r.offeringType,
      package: packageDto,
      period,
      totalPrice,
      groups,
      note: r.remark ?? '',
      actions,
      slip,
      timeline,
    };
  }

  private buildGroups(r: Reservation): GetReservationDetailGroupDto[] {
    const byGroup = new Map<number, Reservation['reservationLines']>();
    for (const line of r.reservationLines ?? []) {
      const g = line.groupNumber;
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g)!.push(line);
    }
    const sorted = Array.from(byGroup.entries()).sort(([a], [b]) => a - b);
    return sorted.map(([groupNumber, lines]) => {
      const first = lines[0];
      const offering = first?.offering;
      const offerCode = offering?.isVip
        ? 'VIP'
        : (offering?.offerSizePricing?.size?.toUpperCase() ?? 'UNKNOWN');
      const offerLabel = offering
        ? `${offering.name} • ห้อง ${groupNumber}`
        : `ห้อง ${groupNumber}`;
      const petIds: GetReservationDetailPetIdDto[] = lines.map((line) => ({
        petId: line.dog?.id ?? 0,
        name: line.dog?.name ?? '',
        sizeLabel: line.dog?.breed?.size?.toLowerCase() ?? '',
      }));
      return {
        groupNumber,
        offerCode,
        offerLabel,
        capacity: petIds.length,
        petIds,
      };
    });
  }

  private buildTimeline(r: Reservation): GetReservationDetailTimelineItemDto[] {
    const logs = (r.statusLogs ?? []).slice().sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
    const byStatus = new Map<ReservationStatusEnum, (typeof logs)[0]>();
    for (const log of logs) {
      byStatus.set(log.status, log);
    }
    const owner = r.dogOwner as { id?: number; firstName?: string; lastName?: string } | undefined;
    const ownerId = owner?.id ?? null;
    const ownerName =
      [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || null;

    return TIMELINE_STEPS.map(({ key, label }) => {
      const log = byStatus.get(key);
      const at = log?.occurredAt
        ? new Date(log.occurredAt).toISOString().replace('Z', '+07:00')
        : null;
      const by = log?.performedBy ?? null;
      const detail = log?.label ?? null;
      let actorRole: string | null = null;
      if (by != null && ownerId != null) {
        actorRole = Number(by) === ownerId ? 'DOG_OWNER' : 'STAFF';
      }
      return { key, label, at, by, detail, actorRole, ownerId, ownerName };
    });
  }

  private buildSlip(r: Reservation): GetReservationDetailSlipDto {
    const required = r.status === ReservationStatusEnum.WAITING_SLIP;
    const slip = r.paymentSlip;
    const status = slip ? 'uploaded' : 'pending';
    const imageUrl = slip?.slipUrl ?? '';
    const rejectedReason = slip?.rejectedReason ?? undefined;
    return { required, status, imageUrl, ...(rejectedReason && { rejectedReason }) };
  }

  private buildActions(r: Reservation): GetReservationDetailActionsDto {
    const canViewTimeline = true;
    const canUploadSlip = r.status === ReservationStatusEnum.WAITING_SLIP;
    const canCancel = r.status === ReservationStatusEnum.PENDING;
    const cancelHint = 'การยกเลิกทำได้เฉพาะสถานะ "รอการยืนยัน"';
    return { canViewTimeline, canUploadSlip, canCancel, cancelHint };
  }
}
