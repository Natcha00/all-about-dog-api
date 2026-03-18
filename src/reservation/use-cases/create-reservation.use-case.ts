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
import { ReservationNotificationService } from '../reservation-notification.service';
import { OfferingService } from 'src/offering/offering.service';
import { AssignDogs } from 'src/offering/types/assign-dog.type';
import { Dog } from 'src/dog/entities/dog.entity';
import { ReservationLineInput } from '../types/reservation-line-input.type';
import { OfferCoatPricing } from 'src/offering/entities/offer-coat-pricing.entity';
import { CoatType } from 'src/dog/enums/coat-type.enum';

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
    private readonly reservationNotificationService: ReservationNotificationService,
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

      const conflicts = await this.reservationRepository.findSwimmingConflictsByDogIds(
        {
          start: startDateTime,
          end: endDateTime,
          dogIds: body.dogIds,
        },
      );
      if (conflicts.length > 0) {
        const conflictDogIds = new Set<number>();
        for (const r of conflicts) {
          for (const line of r.reservationLines ?? []) {
            if (line.dog?.id != null) conflictDogIds.add(line.dog.id);
          }
        }

        const conflictDogNames = dogs
          .filter((d) => conflictDogIds.has(d.id))
          .map((d) => d.name)
          .filter(Boolean);

        const dateStr = startDateTime.toISOString().slice(0, 10);
        const dogsLabel =
          conflictDogNames.length > 0
            ? ` (${conflictDogNames.join(', ')})`
            : '';
        throw new BadRequestException(
          `สุนัขตัวนี้มีการจองว่ายน้ำซ้ำในรอบเดิมของวันเดียวกันแล้ว: ${dateStr} ${startTimeSlot}${dogsLabel}`,
        );
      }

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

    await this.reservationNotificationService.sendStatusUpdatedEmail(
      saved.code,
      ReservationStatusEnum.PENDING,
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

  /** Duplicated from GetSwimmingPackagePricingUsecase: get coat pricing + swimming offering, build one line per dog */
  private async buildSwimmingLines(dogs: Dog[]): Promise<ReservationLineInput[]> {
    const offerCoatPricings = await this.offeringService.getCoatPricing();
    const priceByDogId = this.calculateSwimmingPriceByCoat(dogs, offerCoatPricings);
    const offering = await this.offeringService.getSwimmingOffering();
    if (!offering) {
      throw new NotFoundException('Swimming offering not found');
    }
    const lines: ReservationLineInput[] = [];
    for (let index = 0; index < dogs.length; index++) {
      const dog = dogs[index];
      lines.push({
        offeringId: offering.id,
        dogId: dog.id,
        price: priceByDogId.get(dog.id) ?? 0,
        quantity: 1,
        groupNumber: index + 1,
      });
    }
    return lines;
  }

  /**
   * คำนวณราคาว่ายน้ำต่อตัวจาก coat + น้ำหนัก ตาม tier ใน offer coat pricing
   * ข้อยกเว้น: คอร์กี้ = 850, โกลเด้นรีทรีฟเวอร์ = 1200
   */
  private calculateSwimmingPriceByCoat(
    dogs: Dog[],
    offerCoatPricings: OfferCoatPricing[],
  ): Map<number, number> {
    const tiersByCoat = new Map<
      CoatType,
      Array<{ max_weight: number; price: number }>
    >();
    for (const p of offerCoatPricings) {
      const list = tiersByCoat.get(p.coat) ?? [];
      list.push({ max_weight: p.max_weight, price: p.price });
      tiersByCoat.set(p.coat, list);
    }
    for (const list of tiersByCoat.values()) {
      list.sort((a, b) => a.max_weight - b.max_weight);
    }

    const result = new Map<number, number>();
    for (const d of dogs) {
      const breedName = d.breed?.nameTh?.trim() ?? '';
      if (breedName === 'คอร์กี้') {
        result.set(d.id, 850);
        continue;
      }
      if (breedName === 'โกลเด้นรีทรีฟเวอร์') {
        result.set(d.id, 1200);
        continue;
      }
      const coat = d.coatType;
      const weight = d.weight ?? 0;
      const tiers = tiersByCoat.get(coat);
      const tier = tiers?.find((t) => t.max_weight >= weight);
      result.set(d.id, tier?.price ?? 0);
    }
    return result;
  }
}
