import { Injectable } from '@nestjs/common';
import { DogService } from 'src/dog/services/dog.service';
import {
  GetBoardingAvailableRequest,
  GetBoardingAvailableResponse,
} from '../dtos/get-boarding-available.dto';
import { BoardingSummary } from 'src/reservation/types/boarding-summary';
import { BoardingCounter } from '../types/boarding-counter.type';
import { OfferingType } from '../enums/offering-type.enum';
import { OfferingRepository } from '../offering.repository';
import { ReservationService } from 'src/reservation/reservation.service';
import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';

@Injectable()
export class GetBoardingAvailableUsecase {
  constructor(
    private readonly dogService: DogService,
    private readonly offeringRepository: OfferingRepository,
    private readonly reservationService: ReservationService,
  ) {}

  /** สร้าง BoardingSummary เฉพาะคืนที่อยู่ระหว่าง start–end (ไม่รวมวัน checkout)
   *  เช่น start=2026-02-25T09:00, end=2026-02-27T18:00 → แสดง 2026-02-25, 2026-02-26
   */
  private getBoardingSummariesInRange(
    startStr: string,
    endStr: string,
    summaryByDate: Map<string, BoardingCounter>,
  ): BoardingSummary[] {
    const empty: BoardingCounter = { LARGE: 0, SMALL: 0, VIP: 0 };
    const result: BoardingSummary[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    const current = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0,
      0,
    );
    const endDateOnly = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      0,
      0,
      0,
      0,
    );

    while (current.getTime() < endDateOnly.getTime()) {
      const dateKey = this.toLocalDateString(current);
      result.push({
        date: dateKey,
        boardingCounter: summaryByDate.get(dateKey) ?? { ...empty },
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  }

  /** รูป YYYY-MM-DD ตาม timezone ปัจจุบัน (Bangkok) */
  private toLocalDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async execute(
    getBoardingAvailableRequest: GetBoardingAvailableRequest,
    dogOwnerId: number,
  ) {
    //query dogs
    const dogs = await this.dogService.getDogByIds(
      getBoardingAvailableRequest.dogIds,
      dogOwnerId,
    );

    /* 
        Match dogs with available offerings.
        Offerings are divided into:
        - Swimming offering
        - Boarding offering

        For boarding offering:
        - Dogs are categorized as small or large.
        - Customers can choose either:
            • Standard accommodation (one dog per room), or
            • Shared accommodation (two dogs per room at a discounted price).
    */

    // assign dogs to offerings
    const offerings = await this.offeringRepository.getBoardingOffering();
    const assignDogs = this.reservationService.assignDogs(
      dogs,
      offerings,
      getBoardingAvailableRequest.package,
    );
    const need = this.reservationService.boardingSummary(assignDogs);

    // count nights
    const nights = this.reservationService.countByRange(
      {
        start: getBoardingAvailableRequest.start,
        end: getBoardingAvailableRequest.end,
      },
      OfferingType.BOARDING,
    );

    // get reservations by period
    const reservations = await this.reservationService.getReservationByPeriod(
      new Date(getBoardingAvailableRequest.start),
      new Date(getBoardingAvailableRequest.end),
    );

    // summarize boarding by date
    const allSummaries =
      this.reservationService.summarizeBoardingByDate(reservations);

    // แสดงเฉพาะช่วงวันที่ user เลือก (start <= date < end)
    const startStr = getBoardingAvailableRequest.start.slice(0, 10);
    const endStr = getBoardingAvailableRequest.end.slice(0, 10);
    const summaryByDate = new Map<string, BoardingCounter>(
      allSummaries.map((s) => [s.date, s.boardingCounter]),
    );
    const boardingSummariesInRange = this.getBoardingSummariesInRange(
      startStr,
      endStr,
      summaryByDate,
    );

    const fails = this.reservationService.checkBoardingAvailability(
      assignDogs,
      boardingSummariesInRange,
    );
    const available = fails.every((f) => f.status === 'sufficient');

    const dogIdSet = new Set(getBoardingAvailableRequest.dogIds);
    const activeBoardingReservations = reservations.filter(
      (r) =>
        r.offeringType === OfferingType.BOARDING &&
        r.status !== ReservationStatusEnum.CANCELLED,
    );
    // สำหรับ boarding นับ period ถึง end - 1 วัน (ไม่รวมวัน checkout)
    const periodStart = new Date(getBoardingAvailableRequest.start);
    periodStart.setHours(0, 0, 0, 0);
    periodStart.setHours(periodStart.getHours() + 7);
    const periodEndLastDay = new Date(getBoardingAvailableRequest.end);
    periodEndLastDay.setDate(periodEndLastDay.getDate() - 1);
    periodEndLastDay.setHours(23, 59, 59, 999);
    periodEndLastDay.setHours(periodEndLastDay.getHours() + 7);
    const inPeriod = activeBoardingReservations.filter((r) => {
      const rEndMinusOne = new Date(r.endDateTime);
      rEndMinusOne.setDate(rEndMinusOne.getDate() - 1);
      return (
        r.startDateTime <= periodEndLastDay && rEndMinusOne >= periodStart
      );
    });
    const hasDogInReservationInPeriod = inPeriod.some((r) =>
      (r.reservationLines ?? []).some(
        (line) => line.dog?.id != null && dogIdSet.has(line.dog.id),
      ),
    );

    const result: GetBoardingAvailableResponse = {
      available,
      message: this.getBoardingAvailabilityMessage(available).message,
      hint: this.getBoardingAvailabilityMessage(available).hint,
      range: {
        start: getBoardingAvailableRequest.start,
        end: getBoardingAvailableRequest.end,
      },
      nights,
      roomPerNight: need,
      package: getBoardingAvailableRequest.package,
      need,
      fails: available ? [] : fails,
      hasDogInReservationInPeriod,
    };
    return result;
  }

  private getBoardingAvailabilityMessage(isAvailable: boolean): {
    message: string;
    hint: string;
  } {
    if (isAvailable) {
      return { message: 'ห้องว่างตลอดช่วงที่เลือก ✅', hint: '' };
    } else {
      return {
        message: 'ห้องไม่ว่างครบทุกคืน ❌',
        hint: 'กรุณาเลือกวันใหม่ (มีอย่างน้อย 1 คืนที่ห้องไม่พอ)',
      };
    }
  }
}
