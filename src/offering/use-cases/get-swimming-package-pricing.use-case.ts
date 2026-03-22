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
import {
  buildSwimmingCoatBandsByCoat,
  swimmingPriceForDog,
} from '../swimming-pricing';

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
    // ปิดรอบที่สุนัข (ใน request.dogIds) เคยจองแล้วในวันเดียวกัน (non-cancelled เท่านั้น)
    const isEverReservedByTime = new Map<string, boolean>();
    for (const slot of slotsRaw) {
      const hourStr = slot.time.split(':')[0];
      const hour = Number(hourStr);
      const slotStart = new Date(request.date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(request.date);
      slotEnd.setHours(hour, 59, 59, 999);

      const isEverReserved = activeReservations.some((r) => {
        const rStart = new Date(r.startDateTime);
        const rEnd = new Date(r.endDateTime);
        const overlaps = rStart < slotEnd && rEnd > slotStart;
        if (!overlaps) return false;

        return (r.reservationLines ?? []).some(
          (line) => line.dog?.id != null && dogIdSet.has(line.dog.id),
        );
      });

      isEverReservedByTime.set(slot.time, isEverReserved);
    }
    const summaryByHour = new Map(
      swimmingSummaries.map((s) => [s.hour, s.swimmingCounter]),
    );
    const slots = slotsRaw.map((slot) => {
      const counter = summaryByHour.get(slot.time) ?? { LARGE: 0, SMALL: 0 };
      return {
        ...slot,
        isFull: totalPets > slot.remaining,
        sizeBooked: { large: counter.LARGE, small: counter.SMALL },
        isEverReserved: isEverReservedByTime.get(slot.time) ?? false,
      };
    });   

    const [offerCoatPricings, breedBandPricings] = await Promise.all([
      this.offeringRepository.getOfferCoatPricing(),
      this.offeringRepository.getSwimmingBreedWeightBandPricing(),
    ]);
    const pricingItems = this.getSwimmingPricingByCoat(
      dogs,
      offerCoatPricings,
      breedBandPricings,
    );
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
      hasDogInReservationInPeriod, // ใช้คู่กับ FE (เช่น แสดงว่าเคยจองแล้ว)
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

  /**
   * คำนวณราคาว่ายน้ำจาก coat + น้ำหนัก; ถ้ามี `offer_breed_pricing` ช่วง min–max kg ให้ใช้ normalPrice เฉพาะในช่วงนั้น
   */
  private getSwimmingPricingByCoat(
    dogs: Dog[],
    offerCoatPricings: OfferCoatPricing[],
    breedBandPricings: OfferBreedPricing[],
  ): SwimmingPricingItemDto[] {
    const bandsByCoat = buildSwimmingCoatBandsByCoat(offerCoatPricings);
    return dogs.map((d) => ({
      dogId: d.id,
      name: d.name,
      breed: d.breed?.nameTh ?? '-',
      coatType: d.coatType,
      price: swimmingPriceForDog(d, bandsByCoat, breedBandPricings),
    }));
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
