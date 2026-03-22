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
  GetReservationDetailDogIdDto,
  GetReservationDetailActionsDto,
  GetReservationDetailSlipDto,
  GetReservationDetailTimelineItemDto,
} from '../dtos/get-reservation-detail.dto';
import { ReservationStatusLog } from '../entities/reservation-status-log.entity';
import { StaffRepository } from 'src/staff/staff.repository';
import { GetDogOwnerByIdUsecase } from 'src/dog-owner/use-cases/get-dog-owner-by-id.use-case';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const STATUS_LABELS: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยัน',
  [ReservationStatusEnum.WAITING_SLIP]: 'รออัปโหลดสลิป',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอตรวจสลิป',
  [ReservationStatusEnum.PAY_AT_STORE]: 'รอชำระเงินหน้าร้าน',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ยืนยันแล้ว',
  [ReservationStatusEnum.CHECK_IN]: 'อยู่ระหว่างใช้บริการ',
  [ReservationStatusEnum.FINISHED]: 'เสร็จสิ้น',
  [ReservationStatusEnum.CANCELLED]: 'ยกเลิก',
};

const STATUS_HINTS: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยันจากระบบ',
  [ReservationStatusEnum.WAITING_SLIP]: 'แนบสลิปเพื่อให้พนักงานตรวจสอบ',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอพนักงานตรวจสอบสลิป',
  [ReservationStatusEnum.PAY_AT_STORE]: 'รอชำระเงินที่ร้าน',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ชำระเงินเรียบร้อย',
  [ReservationStatusEnum.CHECK_IN]: 'สามารถเช็คอินได้',
  [ReservationStatusEnum.FINISHED]: 'จบการใช้บริการ',
  [ReservationStatusEnum.CANCELLED]: 'การจองถูกยกเลิก',
};

const STATUS_TONE: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'warning',
  [ReservationStatusEnum.WAITING_SLIP]: 'warning',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'warning',
  [ReservationStatusEnum.PAY_AT_STORE]: 'warning',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'success',
  [ReservationStatusEnum.CHECK_IN]: 'info',
  [ReservationStatusEnum.FINISHED]: 'success',
  [ReservationStatusEnum.CANCELLED]: 'error',
};

const SERVICE_LABELS: Record<OfferingType, string> = {
  [OfferingType.BOARDING]: 'ฝากเลี้ยง',
  [OfferingType.SWIMMING]: 'ว่ายน้ำ',
};

const STATUS_TIMELINE_LABELS: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'สร้างรายการจอง',
  [ReservationStatusEnum.WAITING_SLIP]: 'รอชำระเงิน',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'อัปโหลดสลิปแล้ว',
  [ReservationStatusEnum.PAY_AT_STORE]: 'รอชำระเงินหน้าร้าน',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ยืนยันการชำระเงินโดยพนักงาน',
  [ReservationStatusEnum.CHECK_IN]: 'Check-in',
  [ReservationStatusEnum.FINISHED]: 'จบการใช้บริการ',
  [ReservationStatusEnum.CANCELLED]: 'ยกเลิกการจอง',
};

@Injectable()
export class GetReservationDetailUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly staffRepository: StaffRepository,
    private readonly getDogOwnerByIdUsecase: GetDogOwnerByIdUsecase,
  ) {}

  async execute(
    code: string,
    dogOwnerId: number,
    viewerIsStaff = false,
  ): Promise<GetReservationDetailResultResponse> {
    const reservation = await this.reservationRepository.findOneByCodeAndDogOwnerId(
      code,
      dogOwnerId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    const performerNameMap = await this.resolvePerformerNames(
      reservation.statusLogs ?? [],
    );
    return this.toDetailResult(reservation, performerNameMap, viewerIsStaff);
  }

  /** ค้นหาชื่อจาก id ตาม actorRole (STAFF → Staff, DOG_OWNER → DogOwner) */
  private async resolvePerformerNames(
    logs: ReservationStatusLog[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const seen = new Set<string>();
    for (const log of logs) {
      const by = log.performedBy?.trim();
      if (!by) continue;
      const key = `${by}-${log.actorRole ?? 'unknown'}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const id = Number(by);
      if (Number.isNaN(id)) continue;
      let name: string | null = null;
      if (log.actorRole === 'STAFF') {
        const staff = await this.staffRepository.findById(id);
        name = staff
          ? [staff.firstName, staff.lastName].filter(Boolean).join(' ').trim() || null
          : null;
      } else if (log.actorRole === 'DOG_OWNER') {
        const owner = await this.getDogOwnerByIdUsecase.execute(id);
        name = owner
          ? [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim() || null
          : null;
      } else {
        const staff = await this.staffRepository.findById(id);
        if (staff) {
          name = [staff.firstName, staff.lastName].filter(Boolean).join(' ').trim() || null;
        } else {
          const owner = await this.getDogOwnerByIdUsecase.execute(id);
          name = owner
            ? [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim() || null
            : null;
        }
      }
      if (name) map.set(key, name);
    }
    return map;
  }

  private toDetailResult(
    r: Reservation,
    performerNameMap: Map<string, string>,
    viewerIsStaff: boolean,
  ): GetReservationDetailResultResponse {
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
    const timeline = this.buildTimeline(r, performerNameMap);
    const packageDto: GetReservationDetailPackageDto = {
      code: 'standard',
      label: 'แบบมาตรฐาน',
    };
    const period: GetReservationDetailPeriodDto =
      r.offeringType === OfferingType.SWIMMING
        ? {
            date: toDateStr(start),
            start: toTimeStr(start),
            end: toTimeStr(end),
          }
        : {
            date: toDateStr(start),
            start: toDateStr(start),
            end: toDateStr(end),
          };
    const slip = this.buildSlip(r);
    const actions = this.buildActions(r, viewerIsStaff);
    const statusHint = this.resolveStatusHint(r);

    return {
      bookingCode: r.code,
      paymentMethod: this.resolvePaymentMethod(r),
      status: r.status,
      statusLabel: STATUS_LABELS[r.status] ?? r.status,
      statusHint,
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

  private resolvePaymentMethod(r: Reservation): 'cash' | 'slip' | null {
    if (r.paymentSlip?.slipUrl) {
      return 'slip';
    }

    const selectedSlipTransfer = (r.statusLogs ?? []).some(
      (log) => (log.label ?? '').trim() === 'เลือกชำระด้วยสลิปโอน',
    );
    if (selectedSlipTransfer) {
      return 'slip';
    }

    const selectedCash = (r.statusLogs ?? []).some(
      (log) => (log.label ?? '').trim() === 'เลือกชำระเงินสดหน้างาน',
    );
    if (selectedCash) {
      return 'cash';
    }

    /** ว่ายน้ำที่ staff อนุมัติแล้ว = ชำระหน้าร้าน (ไม่มีสลิป) */
    if (
      r.offeringType === OfferingType.SWIMMING &&
      [
        ReservationStatusEnum.PAY_AT_STORE,
        ReservationStatusEnum.SLIP_VERIFIED,
        ReservationStatusEnum.CHECK_IN,
        ReservationStatusEnum.FINISHED,
      ].includes(r.status)
    ) {
      return 'cash';
    }

    if (
      r.offeringType === OfferingType.BOARDING &&
      r.status === ReservationStatusEnum.PAY_AT_STORE
    ) {
      return 'cash';
    }

    return null;
  }

  /** คำอธิบายสถานะ — flow ชำระสลิป vs หน้าร้าน + ยืนยันโดยพนักงาน */
  private resolveStatusHint(r: Reservation): string {
    if (
      r.offeringType === OfferingType.BOARDING &&
      r.status === ReservationStatusEnum.WAITING_SLIP
    ) {
      return 'เลือกชำระด้วยสลิปแล้วอัปโหลดสลิป หรือเลือกชำระหน้าร้าน — เมื่อมาจ่ายที่ร้านพนักงานจะยืนยันการรับเงินและทำ Check-in ให้';
    }
    if (
      r.offeringType === OfferingType.BOARDING &&
      r.status === ReservationStatusEnum.PAY_AT_STORE
    ) {
      return 'กรุณามาชำระเงินที่ร้าน เมื่อชำระแล้วพนักงานจะยืนยันการรับเงินและทำ Check-in ให้';
    }
    if (
      r.offeringType === OfferingType.SWIMMING &&
      r.status === ReservationStatusEnum.PAY_AT_STORE
    ) {
      return 'กรุณามาชั่งน้ำหนักและชำระเงินที่ร้าน — เมื่อชำระแล้วพนักงานจะยืนยันการรับเงินและทำ Check-in ให้';
    }
    if (
      r.offeringType === OfferingType.SWIMMING &&
      r.status === ReservationStatusEnum.SLIP_VERIFIED &&
      !r.paymentSlip?.slipUrl
    ) {
      return 'การจองได้รับการยืนยันแล้ว — กรุณามาชั่งน้ำหนักและชำระเงินหน้าร้านตามเวลาที่จอง';
    }
    return STATUS_HINTS[r.status] ?? '';
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
      const dogIds: GetReservationDetailDogIdDto[] = lines.map((line) => ({
        dogId: line.dog?.id ?? 0,
        name: line.dog?.name ?? '',
        sizeLabel: line.dog?.breed?.size?.toLowerCase() ?? '',
      }));
      return {
        groupNumber,
        offerCode,
        offerLabel,
        capacity: dogIds.length,
        dogIds,
      };
    });
  }

  private buildTimeline(
    r: Reservation,
    performerNameMap: Map<string, string>,
  ): GetReservationDetailTimelineItemDto[] {
    const logs = (r.statusLogs ?? []).slice().sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
    const owner = r.dogOwner as { id?: number; firstName?: string; lastName?: string } | undefined;
    const ownerId = owner?.id ?? null;
    const ownerName =
      [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || null;

    return logs.map((log) => {
      const at = log.occurredAt
        ? dayjs(log.occurredAt).add(7, 'hour').tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')
        : null;
      const by = log.performedBy ?? null;
      const detail = log.label ?? null;
      let actorRole: string | null = log.actorRole ?? null;
      if (actorRole == null && by != null && ownerId != null) {
        actorRole = Number(by) === ownerId ? 'DOG_OWNER' : 'STAFF';
      }
      const nameKey = by ? `${by}-${actorRole ?? 'unknown'}` : '';
      const performedByName = nameKey ? performerNameMap.get(nameKey) ?? null : null;
      const label = STATUS_TIMELINE_LABELS[log.status] ?? log.status;
      return {
        key: log.status,
        label,
        at,
        by,
        performedByName,
        detail,
        actorRole,
        ownerId,
        ownerName,
      };
    });
  }

  private buildSlip(r: Reservation): GetReservationDetailSlipDto {
    const choseSlipTransfer = (r.statusLogs ?? []).some(
      (log) => (log.label ?? '').trim() === 'เลือกชำระด้วยสลิปโอน',
    );
    const required =
      r.status === ReservationStatusEnum.WAITING_SLIP && choseSlipTransfer;
    const slip = r.paymentSlip;
    const status = slip ? 'uploaded' : 'pending';
    const imageUrl = slip?.slipUrl ?? '';
    const rejectedReason = slip?.rejectedReason ?? undefined;
    return { required, status, imageUrl, ...(rejectedReason && { rejectedReason }) };
  }

  private buildActions(
    r: Reservation,
    viewerIsStaff: boolean,
  ): GetReservationDetailActionsDto {
    const canViewTimeline = true;
    const choseSlipTransfer = (r.statusLogs ?? []).some(
      (log) => (log.label ?? '').trim() === 'เลือกชำระด้วยสลิปโอน',
    );
    const canUploadSlip =
      r.status === ReservationStatusEnum.WAITING_SLIP && choseSlipTransfer;
    const canSelectPaymentMethod =
      r.status === ReservationStatusEnum.WAITING_SLIP;
    const canCancel = r.status === ReservationStatusEnum.PENDING;
    const cancelHint = 'การยกเลิกทำได้เฉพาะสถานะ "รอการยืนยัน"';
    const canCheckInAfterSlipVerified =
      viewerIsStaff && r.status === ReservationStatusEnum.SLIP_VERIFIED;
    const canConfirmPayAtStoreAndCheckIn =
      viewerIsStaff && r.status === ReservationStatusEnum.PAY_AT_STORE;
    return {
      canViewTimeline,
      canUploadSlip,
      canSelectPaymentMethod,
      canCancel,
      cancelHint,
      canCheckInAfterSlipVerified,
      canConfirmPayAtStoreAndCheckIn,
    };
  }
}
