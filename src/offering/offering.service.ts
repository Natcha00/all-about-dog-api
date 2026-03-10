import { Injectable } from '@nestjs/common';
import { OfferingRepository } from './offering.repository';
import { Offering } from './entities/offering.entity';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';

/**
 * Reservation-related logic (assignDogs, boardingSummary, countByRange,
 * checkBoardingAvailability, checkSwimmingAvailability) has been moved to
 * ReservationService. This class exposes offering data for pricing and create-reservation.
 */
@Injectable()
export class OfferingService {
  constructor(private readonly offeringRepository: OfferingRepository) {}

  async getBoardingOffering(): Promise<Offering[]> {
    return this.offeringRepository.getBoardingOffering();
  }

  async getBreedPricing(): Promise<OfferBreedPricing[]> {
    return this.offeringRepository.getBreedPricing();
  }

  async getSwimmingOffering(): Promise<Offering | null> {
    return this.offeringRepository.getSwimmingOffering();
  }
}
