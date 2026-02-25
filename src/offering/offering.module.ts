import { Module } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { OfferingController } from './offering.controller';
import { OfferingRepository } from './offering.repository';
import { GetAnnouncementUsecase } from './use-cases/get-annoucement.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';
import { OfferVipPricing } from './entities/offer-vip-pricing.entity';
import { OfferSizePricing } from './entities/offer-size-pricing.entity';
import { Offering } from './entities/offering.entity';
import { GetOfferAvailableUsecase } from './use-cases/get-available.use-case';
import { GetOfferPackagePricingUsecase } from './use-cases/get-offer-package-pricing.use-case';
import { DogModule } from 'src/dog/dog.module';
import { ReservationModule } from 'src/reservation/reservation.module';

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
    OfferingService,
    OfferingRepository,
    GetAnnouncementUsecase,
    GetOfferAvailableUsecase,
    GetOfferPackagePricingUsecase,
  ],
})
export class OfferingModule {}
