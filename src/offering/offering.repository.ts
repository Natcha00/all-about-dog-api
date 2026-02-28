import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offering } from './entities/offering.entity';
import { Repository } from 'typeorm';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';
import { OfferingType } from './enums/offering-type.enum';

@Injectable()
export class OfferingRepository {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringTypeormRepository: Repository<Offering>,
    @InjectRepository(OfferBreedPricing)
    private readonly offerBreedPricingTypeormRepository: Repository<OfferBreedPricing>,
  ) {}

  async getOffering() {
    return await this.offeringTypeormRepository.find();
  }

  async getBoardingOffering() {
    return await this.offeringTypeormRepository.find({
      where: {
        offeringType: OfferingType.BOARDING,
      },
      relations:{
        offerSizePricing:true,
        offerVipPricing:true
      }
    });
  }

  async getBreedPricing() {
    return await this.offerBreedPricingTypeormRepository.find({
      relations: {
        breed: true,
      },
    });
  }

  async getSwimmingOffering() {
    return await this.offeringTypeormRepository.findOne({
      where: {
        offeringType: OfferingType.SWIMMING,
      },
    });
  }
}
