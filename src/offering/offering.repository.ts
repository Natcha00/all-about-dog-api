import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offering } from './entities/offering.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';
import { OfferingType } from './enums/offering-type.enum';
import { OfferCoatPricing } from './entities/offer-coat-pricing.entity';
import { OfferSizePricing } from './entities/offer-size-pricing.entity';
import { OfferVipPricing } from './entities/offer-vip-pricing.entity';

@Injectable()
export class OfferingRepository {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringTypeormRepository: Repository<Offering>,
    @InjectRepository(OfferBreedPricing)
    private readonly offerBreedPricingTypeormRepository: Repository<OfferBreedPricing>,
    @InjectRepository(OfferCoatPricing)
    private readonly offerCoatPricingTypeormRepository: Repository<OfferCoatPricing>,
    @InjectRepository(OfferSizePricing)
    private readonly offerSizePricingTypeormRepository: Repository<OfferSizePricing>,
    @InjectRepository(OfferVipPricing)
    private readonly offerVipPricingTypeormRepository: Repository<OfferVipPricing>,
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

  /** Swimming breed rows with a weight band (both min/max set); used instead of coat tiers only inside the band. */
  async getSwimmingBreedWeightBandPricing(): Promise<OfferBreedPricing[]> {
    const swimming = await this.offeringTypeormRepository.findOne({
      where: { offeringType: OfferingType.SWIMMING },
    });
    if (!swimming) return [];
    return this.offerBreedPricingTypeormRepository.find({
      where: {
        offering: { id: swimming.id },
        minWeightKg: Not(IsNull()),
        maxWeightKg: Not(IsNull()),
      },
      relations: { breed: true, offering: true },
    });
  }

  async getOfferCoatPricing() {
    return await this.offerCoatPricingTypeormRepository.find({
      relations: {
        offering: true,
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

  async updateSizePricing(
    pricingId: number,
    values: { normalPrice: number; specialPrice: number },
  ) {
    await this.offerSizePricingTypeormRepository.update(
      { id: pricingId },
      {
        normalPrice: values.normalPrice,
        specialPrice: values.specialPrice,
      },
    );
  }

  async updateVipPricing(
    pricingId: number,
    values: { normalPrice: number; specialPrice: number },
  ) {
    await this.offerVipPricingTypeormRepository.update(
      { id: pricingId },
      {
        normalPrice: values.normalPrice,
        specialPrice: values.specialPrice,
      },
    );
  }

  async updateCoatPricing(pricingId: number, price: number) {
    await this.offerCoatPricingTypeormRepository.update(
      { id: pricingId },
      { price },
    );
  }
}
