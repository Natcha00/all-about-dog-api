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
        Array.from(set).map((dog) => {
          const groupNumber = groupNumberByDogId.get(dog.id) ?? 0;
          return {
            dogId: dog.id,
            name: dog.name,
            groupNumber,
            sizeLabel: dog.breed.size,
            breed: dog.breed.nameTh,
            size: dog.breed.size,
            perNight: offer.pricePerNight.normalPrice,
            subtotal: offer.pricePerNight.normalPrice * nights,
          };
        }),
      ),
    );

    const total = dogLines.reduce((sum, d) => sum + d.subtotal, 0);

    // lines สำหรับเอาไปบันทึก reservation_line (หนึ่ง line ต่อหนึ่ง dog ต่อหนึ่ง offering)
    const lines = this.buildLinesFromAssignDogs(assignDogs, nights);

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
  ): ReservationLineDto[] {
    const lines: ReservationLineDto[] = [];
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
