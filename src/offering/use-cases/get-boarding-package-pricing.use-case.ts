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
    // count nights
    const nights = this.reservationService.countByRange(
      { start: request.start, end: request.end },
      request.offeringType,
    );
    // query dogs
    const dogs = await this.dogService.getDogByIds(request.dogIds, dogOwnerId);

    // assign dogs to offerings
    const offerings = await this.offeringRepository.getBoardingOffering();
    const assignDogs = this.reservationService.assignDogs(
      dogs,
      offerings,
      request.package,
    );

    // สร้าง groups จาก assignDogs (แต่ละ set = 1 group)
    const groups = this.buildGroupsFromAssignDogs(assignDogs, offerings);
    const groupNumberByDogId = new Map<number, number>();
    groups.forEach((g) => {
      g.dogIds.forEach((d) => groupNumberByDogId.set(d.dogId, g.groupNumber));
    });

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

    // lines สำหรับเอาไปบันทึก reservation_line (หนึ่ง line ต่อหนึ่ง dog ต่อหนึ่ง offering)
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

  /** สร้าง lines สำหรับบันทึก ReservationLine (หนึ่ง line ต่อหนึ่ง dog ในแต่ละ group) */
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

  /** แปลง assignDogs เป็น GroupDto[] (แต่ละ set = 1 group) */
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
          capacity: set.size, // จำนวนหมาที่อยู่ในห้องนี้
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
