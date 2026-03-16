import { Injectable } from '@nestjs/common';
import { ReservationService } from 'src/reservation/reservation.service';
import { DogReservationHistoryItemDto } from '../dtos/get-dog-reservation-history.dto';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

@Injectable()
export class GetDogReservationHistoryUsecase {
  constructor(
    private readonly reservationService: ReservationService,
  ) {}

  async execute(dogId: number): Promise<DogReservationHistoryItemDto[]> {
    const reservations =
      await this.reservationService.getFinishedReservationsByDogId(dogId);

    return reservations.map((r) => {
      const start = new Date(r.startDateTime);
      const end = new Date(r.endDateTime);

      // ปรับเป็นเวลาเขตไทย (UTC+7) แล้วค่อย format
      start.setHours(start.getHours() + 7);
      end.setHours(end.getHours() + 7);

      const toDate = (d: Date): string => d.toISOString().slice(0, 10);
      const toTime = (d: Date): string =>
        `${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes(),
        ).padStart(2, '0')}`;

      if (r.offeringType === OfferingType.BOARDING) {
        return {
          offeringType: r.offeringType,
          code: r.code,
          startDate: toDate(start),
          endDate: toDate(end),
        };
      }

      // SWIMMING: แสดงเป็น วันที่ + รอบเวลา (จาก startDateTime)
      return {
        offeringType: r.offeringType,
        code: r.code,
        date: toDate(start),
        time: toTime(start),
      };
    });
  }
}

