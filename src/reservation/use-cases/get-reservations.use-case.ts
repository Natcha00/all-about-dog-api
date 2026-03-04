import { Injectable } from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import {
  GetReservationsResponse,
  GetReservationItemDto,
  GetReservationsCountsDto,
  GetReservationsDogItemDto,
  GetReservationsTimeSlotDto,
} from '../dtos/get-reservations.dto';

const STATUS_LABELS: Record<ReservationStatusEnum, string> = {
  [ReservationStatusEnum.PENDING]: 'รอการยืนยัน',
  [ReservationStatusEnum.WAITING_SLIP]: 'รออัปโหลดสลิป',
  [ReservationStatusEnum.SLIP_UPLOADED]: 'รอตรวจสลิป',
  [ReservationStatusEnum.SLIP_VERIFIED]: 'ยืนยันแล้ว',
  [ReservationStatusEnum.CHECK_IN]: 'อยู่ระหว่างใช้บริการ',
  [ReservationStatusEnum.FINISHED]: 'เสร็จสิ้น',
  [ReservationStatusEnum.CANCELLED]: 'ยกเลิก',
};

@Injectable()
export class GetReservationsUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(
    dogOwnerId: number | undefined,
    tab?: string,
  ): Promise<GetReservationsResponse> {
    const reservations =
      dogOwnerId != null
        ? await this.reservationRepository.findByDogOwnerId(dogOwnerId)
        : await this.reservationRepository.findAll();

    const counts = this.buildCounts(reservations);
    let items = reservations.map((r) => this.toItem(r));

    if (tab && tab !== 'all') {
      const statusByTab = this.getStatusesByTab(tab);
      if (statusByTab.length > 0) {
        items = items.filter((i) =>
          statusByTab.includes(i.status as ReservationStatusEnum),
        );
      }
    }

    return { counts, items };
  }

  private buildCounts(reservations: Reservation[]): GetReservationsCountsDto {
    const counts: GetReservationsCountsDto = {
      [ReservationStatusEnum.PENDING]: 0,
      [ReservationStatusEnum.WAITING_SLIP]: 0,
      [ReservationStatusEnum.SLIP_UPLOADED]: 0,
      [ReservationStatusEnum.SLIP_VERIFIED]: 0,
      [ReservationStatusEnum.CHECK_IN]: 0,
      [ReservationStatusEnum.FINISHED]: 0,
      [ReservationStatusEnum.CANCELLED]: 0,
    };
    for (const r of reservations) {
      if (r.status in counts) {
        counts[r.status]++;
      }
    }
    return counts;
  }

  private getStatusesByTab(tab: string): ReservationStatusEnum[] {
    const valid: ReservationStatusEnum[] = [
      ReservationStatusEnum.PENDING,
      ReservationStatusEnum.WAITING_SLIP,
      ReservationStatusEnum.SLIP_UPLOADED,
      ReservationStatusEnum.SLIP_VERIFIED,
      ReservationStatusEnum.CHECK_IN,
      ReservationStatusEnum.FINISHED,
      ReservationStatusEnum.CANCELLED,
    ];
    if (valid.includes(tab as ReservationStatusEnum)) {
      return [tab as ReservationStatusEnum];
    }
    return [];
  }

  private toItem(r: Reservation): GetReservationItemDto {
    const totalPrice = (r.reservationLines ?? []).reduce(
      (sum, line) => sum + (line.price ?? 0) * (line.quantity ?? 1),
      0,
    );
    const dogsMap = new Map<number, GetReservationsDogItemDto>();
    for (const line of r.reservationLines ?? []) {
      const dog = line.dog;
      if (dog?.id && !dogsMap.has(dog.id)) {
        dogsMap.set(dog.id, { name: dog.name ?? '' });
      }
    }
    const dogs = Array.from(dogsMap.values());
    const dogsLabel = dogs.map((d) => d.name).join(', ');

    const start = new Date(r.startDateTime);
    const end = new Date(r.endDateTime);
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
    const toTimeStr = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const item: GetReservationItemDto = {
      id: r.code,
      status: r.status,
      serviceType: r.offeringType,
      statusLabel: STATUS_LABELS[r.status] ?? r.status,
      dogs,
      dogsLabel,
      totalPrice,
    };
    const owner = r.dogOwner as { id?: number; firstName?: string; lastName?: string } | undefined;
    if (owner?.id != null) {
      item.dogOwnerId = owner.id;
      item.dogOwnerLabel = [owner.firstName, owner.lastName].filter(Boolean).join(' ') || undefined;
    }

    if (r.offeringType === OfferingType.SWIMMING) {
      item.date = toDateStr(start);
      item.timeSlot = {
        start: toTimeStr(start),
        end: toTimeStr(end),
      };
    } else {
      item.checkInDate = toDateStr(start);
      item.checkOutDate = toDateStr(end);
    }

    return item;
  }
}
