import { BadRequestException, Injectable } from '@nestjs/common';
import { Dog } from 'src/dog/entities/dog.entity';
import { Offering } from './entities/offering.entity';
import { OfferingPackage } from './enums/offering-package.enum';
import { AssignDogs } from './types/assign-dog.type';
import { OfferingType } from './enums/offering-type.enum';
import { BoardingCounter } from './types/boarding-counter.type';
import { BoardingSummary } from 'src/reservation/types/boarding-summary';
import { FailDetail } from './dtos/get-boarding-available.dto';

@Injectable()
export class OfferingService {
  private readonly MAXIMUM_SHARED = 2; //จำนวนอยู่ด้วยกันสูงสุด
  private readonly MAXIMUM_VIP_SHARED = 5; //จำนวนอยู่ด้วยกันในห้อง VIP สูงสุด
  /*
        บอกได้ว่า ต้องใช้ offer อะไรกับสุนัขกี่ตัว
    */
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
  ) {
    const result: AssignDogs = new Map();
    if (offeringPackage == OfferingPackage.STANDARD) {
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
    } else if (offeringPackage == OfferingPackage.SHARED) {
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
              found.set.push(new Set(newSet)); // push สำเนา ไม่ใช่ reference เดิม แล้วค่อย clear
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
    } else if (offeringPackage == OfferingPackage.VIP) {
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
    /*
      id = 1 ตึกหมาใหญ่
      id = 2 ตึกหมาเล็ก
      id = 3 VIP
    */
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
      return new Date(input); // รองรับ "YYYY-MM-DD" และ ISO datetime
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
      // นับ "คืน" โดยถือว่า end เป็นวัน checkout (ไม่นับรวม)
      const s = startOfDay(start).getTime();
      const e = startOfDay(end).getTime();
      return Math.max(0, Math.round((e - s) / MS_DAY));
    }

    // SWIMMING: นับ "ชั่วโมง" จากเวลาจริง แล้วปัดขึ้นเป็นจำนวนเต็มชั่วโมง
    const hours = (end.getTime() - start.getTime()) / MS_HOUR;
    return Math.max(0, Math.ceil(hours));
  }


  /**
   * ความจุสูงสุดต่อประเภท (id 1=ตึกหมาใหญ่, 2=ตึกหมาเล็ก, 3=VIP)
   */
  private readonly BOARDING_MAX_CAPACITY: BoardingCounter = {
    LARGE: 9,
    SMALL: 13,
    VIP: 1,
  };

  /**
   * ตรวจสอบความพร้อมของห้องบอร์ดิงแต่ละวัน
   * ส่งคืนรายการต่อวัน: date, status ('available' | 'INSUFFICIENT'), need (ที่ต้องการ), left (ที่เหลือ)
   */
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
}
