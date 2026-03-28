import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import { DogOwnerOtp } from 'src/dog-owner/entities/dog-owner-otp.entity';
import { Breed } from 'src/dog/entities/breed.entity';
import { Dog } from 'src/dog/entities/dog.entity';
import { Health } from 'src/dog/entities/health.entity';
import { VaccinationRecord } from 'src/dog/entities/vaccination-record.entity';
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';
import { OfferSizePricing } from 'src/offering/entities/offer-size-pricing.entity';
import { OfferVipPricing } from 'src/offering/entities/offer-vip-pricing.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import { PaymentSlip } from 'src/reservation/entities/payment-slip.entity';
import { ReservationStatusLog } from 'src/reservation/entities/reservation-status-log.entity';
import { ReservationLine } from 'src/reservation/entities/reservation-line.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { News } from 'src/news/entities/news.entity';
import { OfferCoatPricing } from 'src/offering/entities/offer-coat-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        entities: [
          Dog,
          Breed,
          DogOwner,
          DogOwnerOtp,
          Health,
          VaccinationRecord,
          Reservation,
          ReservationLine,
          PaymentSlip,
          ReservationStatusLog,
          Offering,
          OfferBreedPricing,
          OfferSizePricing,
          OfferVipPricing,
          OfferCoatPricing,
          Staff,
          News
        ],
        synchronize:false,
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
    }),
  ],
})
export class DatabaseModule {}
