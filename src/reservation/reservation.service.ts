import { Injectable } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { Reservation } from './entities/reservation.entity';
import { ReservationLine } from './entities/reservation-line.entity';
import { BoardingSummary } from './types/boarding-summary';
import { BoardingCounter } from 'src/offering/types/boarding-counter.type';
import { ReservationStatusEnum } from './enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { ConfirmReservationRequest } from './dtos/confirm-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async confirmReservation(
    body: ConfirmReservationRequest,
    dogOwnerId: number,
  ): Promise<Reservation> {
    const code = await this.generateReservationCode(body.period.start);
    const startDateTime = new Date(body.period.start);
    const endDateTime = new Date(body.period.end);

    const reservationLines = body.lines.map((line) => ({
      price: line.price,
      quantity: body.nights,
      groupNumber: line.groupNumber,
      offering: { id: line.offeringId } as ReservationLine['offering'],
      dog: { id: line.dogId } as ReservationLine['dog'],
    }));

    const reservation = {
      code,
      status: ReservationStatusEnum.PENDING,
      startDateTime,
      endDateTime,
      remark: body.remark ?? '',
      offeringType: body.offerType,
      dogOwner: { id: dogOwnerId },
      reservationLines,
    } as Reservation;

    return this.reservationRepository.saveReservation(reservation);
  }

  /**
   * สร้าง code รูป RSV-YYYYMMDD-NNNN โดย NNNN เป็น run number ต่อเรื่อยๆ ตามวันที่ (รีเซ็ตทุกวัน)
   */
  private async generateReservationCode(dateStr: string): Promise<string> {
    const datePart = dateStr.slice(0, 10).replace(/-/g, '');
    const run = await this.reservationRepository.getLatestRunNumberForDate(
      dateStr,
    );
    const nextRun = run + 1;
    const runStr = String(nextRun).padStart(4, '0');
    return `RSV-${datePart}-${runStr}`;
  }

  async getReservationByPeriod(
    start: Date,
    end: Date,
    offeringType?: OfferingType,
  ): Promise<Reservation[]> {
    return this.reservationRepository.findByPeriod(start, end, offeringType);
  }


  summarizeBoardingByDate(
    reservations: Array<Reservation>,
  ): Array<BoardingSummary> {
    const resultMap = new Map<string, BoardingCounter>();

    for (const reservation of reservations) {
      if (reservation.offeringType !== 'boarding') continue;
      if (
        reservation.status != ReservationStatusEnum.SLIP_VERIFIED &&
        reservation.status != ReservationStatusEnum.CHECK_IN &&
        reservation.status != ReservationStatusEnum.FINISHED
      )
        continue;

      const start = new Date(reservation?.startDateTime);
      const end = new Date(reservation?.endDateTime);

      const current = new Date(start);
      current.setHours(0, 0, 0, 0);

      const checkout = new Date(end);
      checkout.setHours(0, 0, 0, 0);

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
}
