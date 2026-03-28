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
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';
import { OfferCoatPricing } from 'src/offering/entities/offer-coat-pricing.entity';
import {
  buildSwimmingCoatBandsByCoat,
  swimmingPriceForDog,
} from 'src/offering/swimming-pricing';

/**
 * สร้างการจองใหม่ — สถานะเริ่มที่ PENDING
 * ฝากเลี้ยง: สร้างบรรทัดรายการจากแพ็กเกจ + จำนวนคืน (ยังไม่เช็กความจุห้องที่นี่)
 * ว่ายน้ำ: จำกัดช่วงเวลาเริ่มตามรอบที่เปิด + กันสุนัขซ้ำรอบเดียวกัน (ยังไม่เช็กเต็มสระที่นี่)
 */
@Injectable()
export class CreateReservationUsecase {
  private readonly SWIMMING_HOURS = [
    '09:00',
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

    /** สร้างบรรทัดฝากเลี้ยงจาก assign ห้องตามขนาด/แพ็กเกจ × จำนวนคืน (logic คู่กับ GetBoardingPackagePricingUsecase) */

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
    return this.buildLinesFromAssignDogs(assignDogs, nights, packageType);
  }

  /**  แพ็กเกจ shared/vip ตัวที่ 2 ในกลุ่มใช้ specialPrice */
  private buildLinesFromAssignDogs(
    assignDogs: AssignDogs,
    nights: number,
    packageType: OfferingPackage,
  ): ReservationLineInput[] {
    const lines: ReservationLineInput[] = [];
    let groupNumber = 0;
    for (const [, offerAssign] of assignDogs) {
      for (const set of offerAssign.set) {
        groupNumber++;
        const dogsInGroup = Array.from(set);
        for (let i = 0; i < dogsInGroup.length; i++) {
          const dog = dogsInGroup[i];
          const pricePerNight =
            (packageType === OfferingPackage.SHARED ||
              packageType === OfferingPackage.VIP) &&
            i > 0
              ? offerAssign.pricePerNight.specialPrice
              : offerAssign.pricePerNight.normalPrice;
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

  /** ราคาตามขน/น้ำหนัก (logic คู่กับ GetSwimmingPackagePricingUsecase) */
  private async buildSwimmingLines(dogs: Dog[]): Promise<ReservationLineInput[]> {
    const [offerCoatPricings, breedBandPricings] = await Promise.all([
      this.offeringService.getCoatPricing(),
      this.offeringService.getSwimmingBreedWeightBandPricing(),
    ]);
    const priceByDogId = this.calculateSwimmingPriceByCoat(
      dogs,
      offerCoatPricings,
      breedBandPricings,
    );
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
   * คำนวณราคาว่ายน้ำต่อตัวจาก coat + น้ำหนัก; ช่วง min–max kg ใน offer_breed_pricing ใช้ normalPrice เฉพาะในช่วงนั้น
   */
  private calculateSwimmingPriceByCoat(
    dogs: Dog[],
    offerCoatPricings: OfferCoatPricing[],
    breedBandPricings: OfferBreedPricing[],
  ): Map<number, number> {
    const bandsByCoat = buildSwimmingCoatBandsByCoat(offerCoatPricings);
    const result = new Map<number, number>();
    for (const d of dogs) {
      result.set(d.id, swimmingPriceForDog(d, bandsByCoat, breedBandPricings));
    }
    return result;
  }
}
