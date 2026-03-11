import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../entities/reservation.entity';
import { ReservationLine } from '../entities/reservation-line.entity';
import { CreateReservationRequest } from '../dtos/create-reservation.dto';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { OfferingPackage } from 'src/offering/enums/offering-package.enum';
import { DogService } from 'src/dog/services/dog.service';
import { ReservationStatusLogRepository } from '../reservation-status-log.repository';
import { OfferingService } from 'src/offering/offering.service';
import { AssignDogs } from 'src/offering/types/assign-dog.type';
import { Dog } from 'src/dog/entities/dog.entity';
import { ReservationLineInput } from '../types/reservation-line-input.type';

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
    private readonly statusLogRepository: ReservationStatusLogRepository,
    private readonly offeringService: OfferingService,
  ) {}

  async execute(
    body: CreateReservationRequest,
    dogOwnerId: number,
    performedByUserId: number,
    performedByStaff: boolean,
  ): Promise<Reservation> {
    if (!body.dogIds?.length) {
      throw new BadRequestException('ต้องมีสุนัขอย่างน้อย 1 ตัวในรายการจอง');
    }
    const dogs = await this.dogService.getDogByIds(body.dogIds, dogOwnerId);

    const code = await this.reservationService.generateReservationCode(
      new Date().toISOString(),
    );
    console.log('body.start', body.start);
    console.log('body.end', body.end);
    let startDateTime = new Date(body.start);
    let endDateTime = new Date(body.end);
    let lines: ReservationLineInput[];

    if (body.offeringType === OfferingType.BOARDING) {
      lines = await this.buildBoardingLines(dogs, body.start, body.end, body.package);
    } else if (body.offeringType === OfferingType.SWIMMING) {
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

      lines = await this.buildSwimmingLines(dogs);
    } else {
      throw new BadRequestException('offeringType ต้องเป็น boarding หรือ swimming');
    }

    const reservationLines = lines.map((line) => ({
      price: line.price,
      quantity: line.quantity,
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
      offeringType: body.offeringType,
      dogOwner: { id: dogOwnerId },
      reservationLines,
    } as Reservation;

    const saved = await this.reservationRepository.saveReservation(reservation);

    const label = performedByStaff
      ? 'สร้างรายการจอง โดยพนักงาน'
      : 'สร้างรายการจอง โดยลูกค้า';
    const actorRole = performedByStaff ? 'STAFF' : 'DOG_OWNER';
    await this.statusLogRepository.createAndSave(
      String(saved.id),
      ReservationStatusEnum.PENDING,
      String(performedByUserId),
      label,
      actorRole,
    );

    return saved;
  }

  /** Duplicated from GetBoardingPackagePricingUsecase: build lines for reservation_line from assignDogs + nights */
  private async buildBoardingLines(
    dogs: Dog[],
    start: string,
    end: string,
    packageType: OfferingPackage,
  ): Promise<ReservationLineInput[]> {
    const nights = this.reservationService.countByRange(
      { start, end },
      OfferingType.BOARDING,
    );
    const offerings = await this.offeringService.getBoardingOffering();
    const assignDogs = this.reservationService.assignDogs(
      dogs,
      offerings,
      packageType,
    );
    return this.buildLinesFromAssignDogs(assignDogs, nights);
  }

  /** One line per dog per group; price = pricePerNight, quantity = nights */
  private buildLinesFromAssignDogs(
    assignDogs: AssignDogs,
    nights: number,
  ): ReservationLineInput[] {
    const lines: ReservationLineInput[] = [];
    let groupNumber = 0;
    for (const [, offerAssign] of assignDogs) {
      for (const set of offerAssign.set) {
        groupNumber++;
        const pricePerNight = offerAssign.pricePerNight.normalPrice;
        for (const dog of set) {
          lines.push({
            offeringId: offerAssign.id,
            dogId: dog.id,
            price: pricePerNight,
            quantity: nights,
            groupNumber,
          });
        }
      }
    }
    return lines;
  }

  /** Duplicated from GetSwimmingPackagePricingUsecase: get breed pricing + swimming offering, build one line per dog */
  private async buildSwimmingLines(dogs: Dog[]): Promise<ReservationLineInput[]> {
    const offerBreedPricings =
      await this.offeringService.getBreedPricing();
    const pricingByBreedId = new Map<number, number>();
    for (const p of offerBreedPricings) {
      if (p.breed?.id != null) {
        pricingByBreedId.set(p.breed.id, p.normalPrice);
      }
    }
    const offering = await this.offeringService.getSwimmingOffering();
    if (!offering) {
      throw new NotFoundException('Swimming offering not found');
    }
    const lines: ReservationLineInput[] = [];
    for (let index = 0; index < dogs.length; index++) {
      const dog = dogs[index];
      const breedId = dog.breed?.id;
      const price = breedId != null ? pricingByBreedId.get(breedId) ?? 0 : 0;
      lines.push({
        offeringId: offering.id,
        dogId: dog.id,
        price,
        quantity: 1,
        groupNumber: index + 1,
      });
    }
    return lines;
  }
}
