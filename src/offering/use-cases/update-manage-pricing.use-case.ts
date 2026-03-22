import { Injectable } from '@nestjs/common';
import { OfferingRepository } from '../offering.repository';
import { UpdateManagePricingRequest } from '../dtos/manage-pricing.dto';

@Injectable()
export class UpdateManagePricingUsecase {
  constructor(private readonly offeringRepository: OfferingRepository) {}

  async execute(body: UpdateManagePricingRequest): Promise<{ success: boolean }> {
    const boarding = body.boarding ?? [];
    const swimming = body.swimming ?? [];

    for (const item of boarding) {
      if (item.pricingId <= 0) continue;
      // Try both size and vip pricing tables. Only one table will match this id.
      await this.offeringRepository.updateSizePricing(item.pricingId, {
        normalPrice: item.normalPrice,
        specialPrice: item.specialPrice,
      });
      await this.offeringRepository.updateVipPricing(item.pricingId, {
        normalPrice: item.normalPrice,
        specialPrice: item.specialPrice,
      });
    }

    for (const item of swimming) {
      if (item.pricingId <= 0) continue;
      await this.offeringRepository.updateCoatPricing(item.pricingId, item.price);
    }

    return { success: true };
  }
}
