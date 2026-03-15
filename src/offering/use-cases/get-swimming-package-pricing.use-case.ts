import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GetSwimmingPackagePricingRequest,
  GetSwimmingPackagePricingResponse,
  ReservationLineDto,
  SwimmingPricingItemDto,
} from '../dtos/get-swimming-package-pricing.dto';
import { DogService } from 'src/dog/services/dog.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { OfferingType } from '../enums/offering-type.enum';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';
import { OfferingRepository } from '../offering.repository';
import { Dog } from 'src/dog/entities/dog.entity';
import { OfferBreedPricing } from '../entities/offer-breed-pricing.entity';
import { Offering } from '../entities/offering.entity';
import { OfferCoatPricing } from '../entities/offer-coat-pricing.entity';
import { CoatType } from 'src/dog/enums/coat-type.enum';

@Injectable()
export class GetSwimmingPackagePricingUsecase {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly dogService: DogService,
    private readonly offeringRepository: OfferingRepository,
  ) {}

  async execute(
    request: GetSwimmingPackagePricingRequest,
    dogOwnerId: number,
  ): Promise<GetSwimmingPackagePricingResponse> {
    const dogs = await this.dogService.getDogByIds(request.dogIds, dogOwnerId);
    const smallCount = dogs.filter((d) => d.breed?.size === 'small').length;
    const largeCount = dogs.filter((d) => d.breed?.size === 'large').length;
    const totalPets = dogs.length;
    const labelParts: string[] = [];
    if (smallCount > 0) labelParts.push(`เล็ก ${smallCount}`);
    if (largeCount > 0) labelParts.push(`ใหญ่ ${largeCount}`);
    const petsSummaryLabel = labelParts.length
      ? `สุนัขของฉันขนาด ${labelParts.join(' • ')}`
      : 'สุนัข';

    // get reservations by period
    const start = new Date(request.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(request.date);
    end.setHours(23, 59, 59, 999);
    const reservations = await this.reservationService.getReservationByPeriod(
      start,
      end,
      OfferingType.SWIMMING,
    );

    const reservationsForSummary = reservations;

    const dogIdSet = new Set(request.dogIds);
    const activeReservations = reservations.filter(
      (r) => r.status !== ReservationStatusEnum.CANCELLED,
    );
    const hasDogInReservationInPeriod = activeReservations.some((r) =>
      (r.reservationLines ?? []).some(
        (line) => line.dog?.id != null && dogIdSet.has(line.dog.id),
      ),
    );

    const swimmingSummaries =
      this.reservationService.summarizeSwimmingByHour(reservationsForSummary);

    const slotsRaw = this.reservationService.checkSwimmingAvailability(
      swimmingSummaries,
    );
    const summaryByHour = new Map(
      swimmingSummaries.map((s) => [s.hour, s.swimmingCounter]),
    );
    const slots = slotsRaw.map((slot) => {
      const counter = summaryByHour.get(slot.time) ?? { LARGE: 0, SMALL: 0 };
      return {
        ...slot,
        isFull: totalPets > slot.remaining,
        sizeBooked: { large: counter.LARGE, small: counter.SMALL },
      };
    });   

    const offerCoatPricings =
      await this.offeringRepository.getOfferCoatPricing();
    const pricingItems = this.getSwimmingPricingByCoat(dogs, offerCoatPricings);
    const total = pricingItems.reduce((sum, i) => sum + i.price, 0);

    const offering = await this.offeringRepository.getSwimmingOffering();
    if (!offering) { 
        throw new NotFoundException('Swimming offering not found');
    }
    const lines = this.buildLines(dogs, offering, pricingItems);

    return {
      offerType: request.offeringType,
      date: request.date,
      petsSummary: {
        total: totalPets,
        small: smallCount,
        large: largeCount,
        label: petsSummaryLabel,
      },
      rules: {
        ownerPlayHint: 'ฟรี (เลือกได้)',
        slotHint:
          'เลือกรอบที่รองรับขนาดใกล้เคียงกับน้อง ๆ เพื่อป้องกันอุบัติเหตุ',
      },
      slots,
      pricing: {
        currency: 'THB',
        items: pricingItems,
        total,
      },
      lines,
      hasDogInReservationInPeriod,
    };
  }

  /**
   * Mock reservations for testing summarizeSwimmingByHour.
   * offering.id 1 = LARGE, 2 = SMALL (per reservation.service).
   */
  private buildMockSwimmingReservations(dateStr: string): Reservation[] {
    const base = new Date(dateStr);
    base.setHours(10, 0, 0, 0);
    return [
      {
        id: 'mock-1',
        startDateTime: new Date(base.getTime()),
        endDateTime: new Date(base.getTime() + 60 * 60 * 1000),
        reservationLines: [
          { id: 1, offering: { id: 3 }, dog: { id: 1, breed: { size: 'large' } } },
          { id: 2, offering: { id: 3 }, dog: { id: 2, breed: { size: 'small' } } },
          { id: 3, offering: { id: 3 }, dog: { id: 3, breed: { size: 'small' } } },
          { id: 4, offering: { id: 3 }, dog: { id: 4, breed: { size: 'small' } } },
        ],
        offeringType: OfferingType.SWIMMING,
        status: ReservationStatusEnum.SLIP_VERIFIED,
      } as Reservation,
      {
        id: 'mock-2',
        startDateTime: new Date(base.getTime() + 60 * 60 * 1000),
        endDateTime: new Date(base.getTime() + 2 * 60 * 60 * 1000),
        reservationLines: [
          { id: 3, offering: { id: 3 }, dog: { id: 3, breed: { size: 'large' } } },
          { id: 4, offering: { id: 3 }, dog: { id: 4, breed: { size: 'large' } } },
          { id: 5, offering: { id: 3 }, dog: { id: 5, breed: { size: 'small' } } },
        ],
        offeringType: OfferingType.SWIMMING,
        status: ReservationStatusEnum.SLIP_VERIFIED,
      } as Reservation,
      {
        id: 'mock-3',
        startDateTime: new Date(base.getTime() + 3 * 60 * 60 * 1000),
        endDateTime: new Date(base.getTime() + 4 * 60 * 60 * 1000),
        reservationLines: [
          { id: 6, offering: { id: 3 }, dog: { id: 6, breed: { size: 'small' } } },
        ],
        offeringType: OfferingType.SWIMMING,
        status: ReservationStatusEnum.SLIP_VERIFIED,
      } as Reservation,
    ];
  }

  private getSwimmingPricingByBreed(
    dogs: Dog[],
    offerBreedPricings: OfferBreedPricing[],
  ): SwimmingPricingItemDto[] {
    const pricingByBreedId = new Map<number, number>();
    for (const p of offerBreedPricings) {
      if (p.breed?.id != null) {
        pricingByBreedId.set(p.breed.id, p.normalPrice);
      }
    }
    return dogs.map((d) => {
      const breedId = d.breed?.id;
      const price = breedId != null ? pricingByBreedId.get(breedId) ?? 0 : 0;
      return {
        dogId: d.id,
        name: d.name,
        breed: d.breed?.nameTh ?? '-',
        coatType: d.coatType,
        price,
      };
    });
  }

  /**
   * คำนวณราคาว่ายน้ำจาก coat + น้ำหนัก; ข้อยกเว้น: คอร์กี้ = 850, โกลเด้นรีทรีฟเวอร์ = 1200
   */
  private getSwimmingPricingByCoat(
    dogs: Dog[],
    offerCoatPricings: OfferCoatPricing[],
  ): SwimmingPricingItemDto[] {
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

    return dogs.map((d) => {
      const breedName = d.breed?.nameTh?.trim() ?? '';
      if (breedName === 'คอร์กี้') {
        return {
          dogId: d.id,
          name: d.name,
          breed: d.breed?.nameTh ?? '-',
          coatType: d.coatType,
          price: 850,
        };
      }
      if (breedName === 'โกลเด้นรีทรีฟเวอร์') {
        return {
          dogId: d.id,
          name: d.name,
          breed: d.breed?.nameTh ?? '-',
          coatType: d.coatType,
          price: 1200,
        };
      }
      const coat = d.coatType;
      const weight = d.weight ?? 0;
      const tiers = tiersByCoat.get(coat);
      const tier = tiers?.find((t) => t.max_weight >= weight);
      const price = tier?.price ?? 0;
      return {
        dogId: d.id,
        name: d.name,
        breed: d.breed?.nameTh ?? '-',
        coatType: coat,
        price,
      };
    });
  }

  private buildLines(dogs: Dog[], offering: Offering, pricingItems: SwimmingPricingItemDto[]): ReservationLineDto[] {
    const lines: ReservationLineDto[] = [];
    for (const [index,dog] of dogs.entries()) {
      lines.push({
        offeringId: offering.id,
        dogId: dog.id,
        price: pricingItems.find((p) => p.dogId === dog.id)?.price ?? 0,
        groupNumber: index + 1,
        quantity: 1,
      });
    }
    return lines;
  }
}
