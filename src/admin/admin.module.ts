import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Breed } from 'src/dog/entities/breed.entity';
import { Dog } from 'src/dog/entities/dog.entity';
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';
import { OfferCoatPricing } from 'src/offering/entities/offer-coat-pricing.entity';
import { OfferSizePricing } from 'src/offering/entities/offer-size-pricing.entity';
import { OfferVipPricing } from 'src/offering/entities/offer-vip-pricing.entity';
import { StaffModule } from 'src/staff/staff.module';
import { UserModule } from 'src/user/user.module';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Breed,
      Dog,
      OfferBreedPricing,
      OfferCoatPricing,
      OfferSizePricing,
      OfferVipPricing,
    ]),
    UserModule,
    StaffModule,
  ],
  controllers: [AdminCatalogController],
  providers: [AdminCatalogService],
})
export class AdminModule {}
