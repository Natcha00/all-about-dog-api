import { Injectable } from '@nestjs/common';
import {
  GetBoardingPackagePricingRequest,
  GetBoardingPackagePricingResponse,
  GroupDto,
  GroupDogDto,
  ReservationLineDto,
} from '../dtos/get-boarding-package-pricing.dto';
import { AssignDogs } from '../types/assign-dog.type';
import { Offering } from '../entities/offering.entity';
import { DogService } from 'src/dog/services/dog.service';
import { OfferingRepository } from '../offering.repository';
import { ReservationService } from 'src/reservation/reservation.service';
import { OfferingPackage } from '../enums/offering-package.enum';

/**
 * คำนวณราคาแพ็กเกจฝากเลี้ยงก่อนจอง (preview) — logic เดียวกับตอนสร้างจองใน CreateReservationUsecase
 * flow: นับคืน → โหลดสุนัข → assign ห้องตามแพ็กเกจ → สร้างกลุ่ม/บรรทัดราคา → สรุปยอด + payload สำหรับบันทึก reservation_line
 */
@Injectable()
export class GetBoardingPackagePricingUsecase {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly dogService: DogService,
    private readonly offeringRepository: OfferingRepository,
  ) {}

  async execute(
    request: GetBoardingPackagePricingRequest,
    dogOwnerId: number,
  ): Promise<GetBoardingPackagePricingResponse> {
    /** จำนวนคืนฝากเลี้ยงในช่วง start–end */
    const nights = this.reservationService.countByRange(
      { start: request.start, end: request.end },
      request.offeringType,
    );
    const dogs = await this.dogService.getDogByIds(request.dogIds, dogOwnerId);

    /** จัดสุนัขเข้าห้องตามแพ็กเกจ (standard / shared / vip) — ได้ AssignDogs เป็น Map ต่อ offering */
    const offerings = await this.offeringRepository.getBoardingOffering();
    const assignDogs = this.reservationService.assignDogs(
      dogs,
      offerings,
      request.package,
    );

    /** กลุ่มห้องสำหรับ UI: แต่ละ set ใน assignDogs = 1 group = 1 ห้อง */
    const groups = this.buildGroupsFromAssignDogs(assignDogs, offerings);
    const groupNumberByDogId = new Map<number, number>();
    groups.forEach((g) => {
      g.dogIds.forEach((d) => groupNumberByDogId.set(d.dogId, g.groupNumber));
    });

    /** รายละเอียดราคาต่อสุนัข: shared/vip ตัวที่ 2 ในกลุ่มใช้ specialPrice × จำนวนคืน */
    const dogLines = Array.from(assignDogs.values()).flatMap((offer) =>
      offer.set.flatMap((set) =>
        Array.from(set).map((dog, indexInGroup) => {
          const perNight =
            (request.package === OfferingPackage.SHARED ||
              request.package === OfferingPackage.VIP) &&
            indexInGroup > 0
              ? offer.pricePerNight.specialPrice
              : offer.pricePerNight.normalPrice;
          const groupNumber = groupNumberByDogId.get(dog.id) ?? 0;
          return {
            dogId: dog.id,
            name: dog.name,
            groupNumber,
            sizeLabel: dog.breed.size,
            breed: dog.breed.nameTh,
            size: dog.breed.size,
            perNight,
            subtotal: perNight * nights,
          };
        }),
      ),
    );

    const total = dogLines.reduce((sum, d) => sum + d.subtotal, 0);

    /** โครงเดียวกับตอนสร้างจอง: หนึ่งบรรทัดต่อสุนัข × quantity = คืน */
    const lines = this.buildLinesFromAssignDogs(assignDogs, nights, request.package);

    return {
      offerType: request.offeringType,
      period: {
        start: request.start,
        end: request.end,
        nights,
      },
      package: request.package,
      dogs: dogLines,
      groups,
      pricingSummary: { total, currency: 'THB' },
      lines,
    };
  }

  /** แปลง assignDogs เป็น ReservationLineDto สำหรับบันทึก DB — หนึ่ง line ต่อสุนัขต่อกลุ่ม */
  private buildLinesFromAssignDogs(
    assignDogs: AssignDogs,
    nights: number,
    packageType: OfferingPackage,
  ): ReservationLineDto[] {
    const lines: ReservationLineDto[] = [];
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

  /** แปลง assignDogs เป็น GroupDto[] สำหรับแสดงผล — แต่ละ set = ห้องหนึ่งห้อง */
  private buildGroupsFromAssignDogs(
    assignDogs: AssignDogs,
    offerings: Offering[],
  ): GroupDto[] {
    const result: GroupDto[] = [];
    let groupNumber = 0;
    for (const [, offerAssign] of assignDogs) {
      const offer = offerings.find((o) => o.id === offerAssign.id);
      const offerCode = offer?.isVip
        ? 'VIP'
        : (offer?.offerSizePricing?.size?.toUpperCase() ?? 'UNKNOWN');
      for (let i = 0; i < offerAssign.set.length; i++) {
        const set = offerAssign.set[i];
        groupNumber++;
        result.push({
          groupNumber,
          offerCode,
          offerLabel: `${offerAssign.name} • ห้อง ${i + 1}`,
          capacity: set.size, // จำนวนสุนัขในห้องนี้
          dogIds: Array.from(set).map(
            (dog): GroupDogDto => ({
              dogId: dog.id,
              name: dog.name,
              sizeLabel: dog.breed.size,
            }),
          ),
        });
      }
    }
    return result;
  }
}
