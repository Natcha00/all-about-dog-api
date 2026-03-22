import { Injectable } from '@nestjs/common';
import { OfferingRepository } from '../offering.repository';
import {
  BoardingPricingItemDto,
  GetManagePricingResponse,
  SwimmingPricingItemDto,
} from '../dtos/manage-pricing.dto';

@Injectable()
export class GetManagePricingUsecase {
  constructor(private readonly offeringRepository: OfferingRepository) {}

  async execute(): Promise<GetManagePricingResponse> {
    const [boardingOfferings, swimmingCoatPricings] = await Promise.all([
      this.offeringRepository.getBoardingOffering(),
      this.offeringRepository.getOfferCoatPricing(),
    ]);

    const boarding: BoardingPricingItemDto[] = boardingOfferings
      .map((o) => {
        const pricing = o.isVip ? o.offerVipPricing : o.offerSizePricing;
        if (!pricing) return null;
        return {
          offeringId: o.id,
          offeringName: o.name,
          isVip: o.isVip,
          pricingId: pricing.id,
          normalPrice: pricing.normalPrice,
          specialPrice: pricing.specialPrice,
        };
      })
      .filter((item): item is BoardingPricingItemDto => item != null);

    const swimming: SwimmingPricingItemDto[] = swimmingCoatPricings.map((item) => ({
      pricingId: item.id,
      coat: item.coat,
      maxWeight: item.max_weight,
      price: item.price,
    }));

    return { boarding, swimming };
  }
}
