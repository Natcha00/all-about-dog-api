import { Module } from '@nestjs/common';
import { OfferingController } from './offering.controller';
import { OfferingRepository } from './offering.repository';
import { GetAnnouncementUsecase } from './use-cases/get-annoucement.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';
import { OfferVipPricing } from './entities/offer-vip-pricing.entity';
import { OfferSizePricing } from './entities/offer-size-pricing.entity';
import { Offering } from './entities/offering.entity';
import { GetBoardingAvailableUsecase } from './use-cases/get-boarding-available.use-case';
import { GetBoardingPackagePricingUsecase } from './use-cases/get-boarding-package-pricing.use-case';
import { DogModule } from 'src/dog/dog.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { GetSwimmingPackagePricingUsecase } from './use-cases/get-swimming-package-pricing.use-case';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      OfferBreedPricing,
      OfferVipPricing,
      OfferSizePricing,
      Offering
    ]),
    DogModule,
    ReservationModule
  ],
  controllers: [OfferingController],
  providers: [
    OfferingRepository,
    GetAnnouncementUsecase,
    GetBoardingAvailableUsecase,
    GetBoardingPackagePricingUsecase,
    GetSwimmingPackagePricingUsecase,
  ],
})
export class OfferingModule {}
