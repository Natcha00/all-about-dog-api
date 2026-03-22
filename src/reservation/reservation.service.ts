import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { Reservation } from './entities/reservation.entity';
import { ReservationLine } from './entities/reservation-line.entity';
import { BoardingSummary } from './types/boarding-summary';
import { BoardingCounter } from 'src/offering/types/boarding-counter.type';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import {
  countsTowardBoardingRoomCapacity,
  countsTowardSwimmingPoolCapacity,
} from './reservation-capacity-statuses';
import { SwimmingCounter } from 'src/offering/types/swimming-counter.type';
import { SwimmingSummary } from './types/swimming-summary';
import { Dog } from 'src/dog/entities/dog.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import { OfferingPackage } from 'src/offering/enums/offering-package.enum';
import { AssignDogs } from 'src/offering/types/assign-dog.type';
import { FailDetail } from 'src/offering/dtos/get-boarding-available.dto';
import { Slot } from 'src/offering/types/slot.type';

@Injectable()
export class ReservationService {
  private readonly MAXIMUM_SHARED = 2;
  private readonly MAXIMUM_VIP_SHARED = 5;
  private readonly MAXIMUM_SWIMMING_CAPACITY = 5;
  private readonly SWIMMING_HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  private readonly BOARDING_MAX_CAPACITY: BoardingCounter = {
    LARGE: 9,
    SMALL: 13,
    VIP: 1,
  };

  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  /** ราคาต่อคืน (normal + special): VIP ใช้ offerVipPricing, ที่เหลือใช้ offerSizePricing */
  private getPricePerNight(offer: Offering): {
    normalPrice: number;
    specialPrice: number;
  } {
    if (offer.isVip && offer.offerVipPricing) {
      return {
        normalPrice: offer.offerVipPricing.normalPrice ?? 0,
        specialPrice: offer.offerVipPricing.specialPrice ?? 0,
      };
    }
    return {
      normalPrice: offer.offerSizePricing?.normalPrice ?? 0,
      specialPrice: offer.offerSizePricing?.specialPrice ?? 0,
    };
  }

  assignDogs(
    dogs: Array<Dog>,
    offerings: Array<Offering>,
    offeringPackage: OfferingPackage,
  ): AssignDogs {
    const result: AssignDogs = new Map();
    if (offeringPackage === OfferingPackage.STANDARD) {
      for (const offer of offerings) {
        if (!result.has(offer.id)) {
          result.set(offer.id, {
            id: offer.id,
            name: offer.name,
            set: [],
            pricePerNight: this.getPricePerNight(offer),
          });
        }
        for (const dog of dogs) {
          if (dog.breed.size != offer?.offerSizePricing?.size) {
            continue;
          }
          const found = result.get(offer.id);
          if (found) {
            const newSet: Set<Dog> = new Set();
            newSet.add(dog);
            found.set.push(newSet);
          }
        }
      }
    } else if (offeringPackage === OfferingPackage.SHARED) {
      for (const offer of offerings) {
        if (!result.has(offer.id)) {
          result.set(offer.id, {
            id: offer.id,
            name: offer.name,
            set: [],
            pricePerNight: this.getPricePerNight(offer),
          });
        }
        const newSet: Set<Dog> = new Set();

        for (const dog of dogs) {
          if (dog.breed.size != offer.offerSizePricing?.size) {
            continue;
          }
          newSet.add(dog);

          if (newSet.size >= this.MAXIMUM_SHARED) {
            const found = result.get(offer.id);
            if (found) {
              found.set.push(new Set(newSet));
            }
            newSet.clear();
          }
        }

        if (newSet.size > 0) {
          const found = result.get(offer.id);
          if (found) {
            found.set.push(newSet);
          }
        }
      }
    } else if (offeringPackage === OfferingPackage.VIP) {
      for (const offer of offerings) {
        if (!offer.isVip) {
          continue;
        }
        if (!result.has(offer.id)) {
          result.set(offer.id, {
            id: offer.id,
            name: offer.name,
            set: [],
            pricePerNight: this.getPricePerNight(offer),
          });
        }
        const newSet: Set<Dog> = new Set();

        for (const dog of dogs) {
          if (newSet.size > this.MAXIMUM_VIP_SHARED) {
            throw new BadRequestException(
              'vip boarding must be less than 5 dogs',
            );
          }
          newSet.add(dog);
        }
        const found = result.get(offer.id);
        if (found) {
          found.set.push(newSet);
        }
      }
    } else {
      throw new BadRequestException('offer package is invalid');
    }

    return result;
  }

  boardingSummary(assignDogs: AssignDogs): BoardingCounter {
    return {
      LARGE: assignDogs.get(1)?.set?.length ?? 0,
      SMALL: assignDogs.get(2)?.set?.length ?? 0,
      VIP: assignDogs.get(3)?.set?.length ?? 0,
    };
  }

  countByRange(
    range: { start: string | Date; end: string | Date },
    offeringType: OfferingType,
  ): number {
    const MS_HOUR = 60 * 60 * 1000;
    const MS_DAY = 24 * MS_HOUR;

    const toDate = (input: string | Date): Date => {
      if (input instanceof Date) return input;
      return new Date(input);
    };

    const startOfDay = (d: Date): Date => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const start = toDate(range.start);
    const end = toDate(range.end);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error('Invalid start/end date');
    }
    if (end.getTime() <= start.getTime()) return 0;

    if (offeringType === OfferingType.BOARDING) {
      const s = startOfDay(start).getTime();
      const e = startOfDay(end).getTime();
      return Math.max(0, Math.round((e - s) / MS_DAY));
    }

    const hours = (end.getTime() - start.getTime()) / MS_HOUR;
    return Math.max(0, Math.ceil(hours));
  }

  checkBoardingAvailability(
    assignDogs: AssignDogs,
    boardingSummaries: BoardingSummary[],
  ): FailDetail[] {
    const need = this.boardingSummary(assignDogs);
    const max = this.BOARDING_MAX_CAPACITY;

    return boardingSummaries.map((summary) => {
      const used = summary.boardingCounter;
      const left: BoardingCounter = {
        LARGE: Math.max(0, max.LARGE - used.LARGE),
        SMALL: Math.max(0, max.SMALL - used.SMALL),
        VIP: Math.max(0, max.VIP - used.VIP),
      };
      const sufficient =
        need.LARGE <= left.LARGE &&
        need.SMALL <= left.SMALL &&
        need.VIP <= left.VIP;
      return {
        date: summary.date,
        status: sufficient ? 'sufficient' : 'insufficient',
        need,
        left,
      };
    });
  }

  checkSwimmingAvailability(swimmingSummaries: SwimmingSummary[]): Slot[] {
    const summaryByHour = new Map(
      swimmingSummaries.map((s) => [s.hour, s.swimmingCounter]),
    );
    const capacity = this.MAXIMUM_SWIMMING_CAPACITY;

    return this.SWIMMING_HOURS.map((time) => {
      const counter = summaryByHour.get(time) ?? { LARGE: 0, SMALL: 0 };
      const booked = counter.LARGE + counter.SMALL;
      const remaining = Math.max(0, capacity - booked);
      const isFull = remaining === 0;
      const isEmpty = booked === 0;
      let statusLabel: string;
      if (isEmpty) statusLabel = 'ว่าง';
      else if (isFull) statusLabel = 'เต็ม';
      else statusLabel = `เหลืออีก ${remaining} ที่`;

      return {
        time,
        capacity,
        booked,
        remaining,
        statusLabel,
        isFull,
        isEmpty,
      };
    });
  }

  async getReservationByPeriod(
    start: Date,
    end: Date,
    offeringType?: OfferingType,
  ): Promise<Reservation[]> {
    return this.reservationRepository.findByPeriod(start, end, offeringType);
  }

  /**
   * ดึงประวัติการจองที่เสร็จสิ้นแล้วของสุนัขตัวหนึ่ง (status = FINISHED)
   */
  async getFinishedReservationsByDogId(dogId: number): Promise<Reservation[]> {
    return this.reservationRepository.findFinishedByDogId(dogId);
  }

  /**
   * สร้าง code รูป RSV-YYYYMMDD-NNNN โดย NNNN เป็น run number ต่อเรื่อยๆ ตามวันที่ (รีเซ็ตทุกวัน)
   */
  async generateReservationCode(dateStr: string): Promise<string> {
    const datePart = dateStr.slice(0, 10).replace(/-/g, '');
    const run = await this.reservationRepository.getLatestRunNumberForDate(
      dateStr,
    );
    const nextRun = run + 1;
    const runStr = String(nextRun).padStart(4, '0');
    return `RSV-${datePart}-${runStr}`;
  }

  summarizeBoardingByDate(
    reservations: Array<Reservation>,
  ): Array<BoardingSummary> {
    const resultMap = new Map<string, BoardingCounter>();

    for (const reservation of reservations) {
      if (reservation.offeringType !== 'boarding') continue;
      if (!countsTowardBoardingRoomCapacity(reservation.status)) continue;

      const start = new Date(reservation?.startDateTime);
      const end = new Date(reservation?.endDateTime);

      const current = new Date(start);
      current.setHours(0, 0, 0, 0);
      current.setHours(current.getHours() + 7);

      const checkout = new Date(end);
      checkout.setHours(0, 0, 0, 0);
      checkout.setHours(checkout.getHours() + 7);

      // 🔥 กัน groupNumber ซ้ำ (1 group = 1 ห้อง)
      const grouped = new Map<number, number>();
      // key = groupNumber, value = offeringId

      for (const line of reservation.reservationLines) {
        if (!grouped.has(line.groupNumber)) {
          grouped.set(line.groupNumber, line.offering.id);
        }
      }

      while (current < checkout) {
        const dateKey = current.toISOString().split('T')[0];

        if (!resultMap.has(dateKey)) {
          resultMap.set(dateKey, {
            SMALL: 0,
            LARGE: 0,
            VIP: 0,
          });
        }

        const counter = resultMap.get(dateKey)!;

        for (const offeringId of grouped.values()) {
          if (offeringId === 1) counter.LARGE += 1;
          if (offeringId === 2) counter.SMALL += 1;
          if (offeringId === 3) counter.VIP += 1;
        }

        current.setDate(current.getDate() + 1);
      }
    }

    return Array.from(resultMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, boardingCounter]) => ({
        date,
        boardingCounter,
      }));
  }


  /**
   * นับจำนวนสุนัขในสระ (แยกขนาด LARGE/SMALL) ต่อชั่วโมง
   * ใช้ช่วง startDateTime–endDateTime ของแต่ละการจอง กระจายเข้าแต่ละชั่วโมงที่การจองครอบคลุม
   */
  summarizeSwimmingByHour(
    reservations: Array<Reservation>,
  ): Array<SwimmingSummary> {
    const resultMap = new Map<string, SwimmingCounter>();

    for (const reservation of reservations) {
      if (reservation.offeringType !== OfferingType.SWIMMING) continue;
      if (!countsTowardSwimmingPoolCapacity(reservation.status)) continue;

      const start = new Date(reservation.startDateTime);
      const end = new Date(reservation.endDateTime);

      // ปัด start ลงเป็นต้นชั่วโมง (เช่น 10:30 → 10:00)
      const slotStart = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        start.getHours(),
        0,
        0,
        0,
      );
      const slotEnd = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        end.getHours(),
        0,
        0,
        0,
      );

      const lineCount = { LARGE: 0, SMALL: 0 };
      for (const line of reservation.reservationLines) {
        const size = line.dog?.breed?.size?.toLowerCase?.();
        if (size === 'large') lineCount.LARGE += 1;
        else if (size === 'small') lineCount.SMALL += 1;
      }

      // กระจายจำนวนเข้าแต่ละชั่วโมงที่การจองครอบคลุม
      const current = new Date(slotStart);
      while (current.getTime() < slotEnd.getTime()) {
        const dateKey = current.toISOString().slice(0, 10);
        const hourStr = String(current.getHours()).padStart(2, '0') + ':00';
        const key = `${dateKey} ${hourStr}`;

        if (!resultMap.has(key)) {
          resultMap.set(key, { LARGE: 0, SMALL: 0 });
        }
        const counter = resultMap.get(key)!;
        counter.LARGE += lineCount.LARGE;
        counter.SMALL += lineCount.SMALL;

        current.setHours(current.getHours() + 1);
      }
    }

    return Array.from(resultMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, swimmingCounter]) => ({
        hour: key.includes(' ') ? key.split(' ')[1] : key,
        swimmingCounter,
      }));
  }

  /**
   * ตรวจสอบว่าสุนัขตัวนี้เคยอยู่ในรายการจองของ owner นี้หรือไม่
   */
  async hasDogReservationHistory(
    dogId: number,
    dogOwnerId: number,
  ): Promise<boolean> {
    const reservations = await this.reservationRepository.findByDogOwnerId(
      dogOwnerId,
    );
    return reservations.some((r) =>
      (r.reservationLines ?? []).some((line) => line.dog?.id === dogId),
    );
  }

  /**
   * ว่ายน้ำ: ตรวจว่ารอบเดียวกันยังรับจำนวนสุนัขในการจองนี้ได้ (รวมสถานะที่กันคิวแล้ว)
   */
  async assertSwimmingSlotFits(reservation: Reservation): Promise<void> {
    if (reservation.offeringType !== OfferingType.SWIMMING) return;

    const resStart = new Date(reservation.startDateTime);
    const resEnd = new Date(reservation.endDateTime);
    const dayStart = new Date(resStart);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(resStart);
    dayEnd.setHours(23, 59, 59, 999);

    const all = await this.getReservationByPeriod(
      dayStart,
      dayEnd,
      OfferingType.SWIMMING,
    );

    let large = 0;
    let small = 0;
    const addLines = (r: Reservation) => {
      for (const line of r.reservationLines ?? []) {
        const size = line.dog?.breed?.size?.toLowerCase?.();
        if (size === 'large') large += 1;
        else if (size === 'small') small += 1;
      }
    };

    for (const r of all) {
      if (String(r.id) === String(reservation.id)) continue;
      if (!countsTowardSwimmingPoolCapacity(r.status)) continue;
      const rStart = new Date(r.startDateTime);
      const rEnd = new Date(r.endDateTime);
      if (rEnd <= resStart || rStart >= resEnd) continue;
      addLines(r);
    }
    addLines(reservation);

    if (large + small > this.MAXIMUM_SWIMMING_CAPACITY) {
      throw new BadRequestException(
        'รอบว่ายน้ำนี้เต็มแล้ว ไม่สามารถอนุมัติเพิ่มได้',
      );
    }
  }

  private boardingNeedPerNight(reservation: Reservation): BoardingCounter {
    const grouped = new Map<number, number>();
    for (const line of reservation.reservationLines ?? []) {
      if (!grouped.has(line.groupNumber)) {
        grouped.set(line.groupNumber, line.offering.id);
      }
    }
    const need: BoardingCounter = { LARGE: 0, SMALL: 0, VIP: 0 };
    for (const offeringId of grouped.values()) {
      if (offeringId === 1) need.LARGE += 1;
      if (offeringId === 2) need.SMALL += 1;
      if (offeringId === 3) need.VIP += 1;
    }
    return need;
  }

  /**
   * ฝากเลี้ยง: ตรวจว่ายังมีห้องพอทุกคืนของการจองนี้ (เมื่อจะกันห้อง — slip_verified หรือ check-in จาก pay_at_store)
   */
  async assertBoardingReservationFits(reservation: Reservation): Promise<void> {
    if (reservation.offeringType !== OfferingType.BOARDING) return;

    const reservations = await this.getReservationByPeriod(
      new Date(reservation.startDateTime),
      new Date(reservation.endDateTime),
      OfferingType.BOARDING,
    );
    const others = reservations.filter(
      (r) =>
        String(r.id) !== String(reservation.id) &&
        countsTowardBoardingRoomCapacity(r.status),
    );
    const summaries = this.summarizeBoardingByDate(others);
    const byDate = new Map(
      summaries.map((s) => [s.date, s.boardingCounter]),
    );

    const needPerNight = this.boardingNeedPerNight(reservation);
    const start = new Date(reservation.startDateTime);
    const end = new Date(reservation.endDateTime);
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    current.setHours(current.getHours() + 7);

    const checkout = new Date(end);
    checkout.setHours(0, 0, 0, 0);
    checkout.setHours(checkout.getHours() + 7);

    const max = this.BOARDING_MAX_CAPACITY;

    while (current.getTime() < checkout.getTime()) {
      const dateKey = current.toISOString().split('T')[0];
      const used = byDate.get(dateKey) ?? { LARGE: 0, SMALL: 0, VIP: 0 };
      if (
        used.LARGE + needPerNight.LARGE > max.LARGE ||
        used.SMALL + needPerNight.SMALL > max.SMALL ||
        used.VIP + needPerNight.VIP > max.VIP
      ) {
        throw new BadRequestException(
          `ห้องฝากเลี้ยงไม่พอในช่วงวันที่ ${dateKey}`,
        );
      }
      current.setDate(current.getDate() + 1);
    }
  }
}
