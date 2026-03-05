import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../entities/reservation.entity';
import { ReservationLine } from '../entities/reservation-line.entity';
import { CreateReservationRequest } from '../dtos/confirm-reservation.dto';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { DogService } from 'src/dog/services/dog.service';

@Injectable()
export class CreateReservationUsecase {
  private readonly SWIMMING_HOURS = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly reservationService: ReservationService,
    private readonly dogService: DogService,
  ) {}

  async execute(
    body: CreateReservationRequest,
    dogOwnerId: number,
  ): Promise<Reservation> {
    // validate that all dogs in lines belong to this owner
    const dogIds = body.lines.map((line) => line.dogId);
    if (dogIds.length === 0) {
      throw new BadRequestException('ต้องมีสุนัขอย่างน้อย 1 ตัวในรายการจอง');
    }
    await this.dogService.getDogByIds(dogIds, dogOwnerId);

    const code = await this.reservationService.generateReservationCode(
      new Date().toISOString(),
    );
    let startDateTime = new Date(body.period.start);
    let endDateTime = new Date(body.period.end);

    if (body.offerType === OfferingType.SWIMMING) {
      const startHour = String(startDateTime.getHours()).padStart(2, '0');
      const startMinute = String(startDateTime.getMinutes()).padStart(2, '0');
      const startTimeSlot = `${startHour}:${startMinute}`;
      if (!this.SWIMMING_HOURS.includes(startTimeSlot)) {
        throw new BadRequestException(
          `Swimming start time must be one of: ${this.SWIMMING_HOURS.join(', ')}. Received: ${startTimeSlot}`,
        );
      }
      endDateTime = new Date(startDateTime.getTime());
      endDateTime.setMinutes(59);
      endDateTime.setSeconds(59);
      endDateTime.setMilliseconds(999);
    }

    const quantity =
      body.nights ??
      (body.offerType === OfferingType.BOARDING
        ? this.reservationService.countByRange(
            { start: body.period.start, end: body.period.end },
            OfferingType.BOARDING,
          )
        : 1);

    const reservationLines = body.lines.map((line) => ({
      price: line.price,
      quantity,
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
}
