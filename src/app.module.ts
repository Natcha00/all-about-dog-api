import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DogOwnerModule } from './dog-owner/dog-owner.module';
import { ReservationModule } from './reservation/reservation.module';
import { DogModule } from './dog/dog.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from './dog/entities/dog.entity';
import { Breed } from './dog/entities/breed.entity';
import { DogOwner } from './dog-owner/entities/dog-owner.entity';
import { Health } from './dog/entities/health.entity';
import { VaccinationRecord } from './dog/entities/vaccination-record.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { OfferingModule } from './offering/offering.module';
import { Reservation } from './reservation/entities/reservation.entity';
import { ReservationLine } from './reservation/entities/reservation-line.entity';
import { Offering } from './offering/entities/offering.entity';
import { OfferBreedPricing } from './offering/entities/offer-breed-pricing.entity';
import { OfferSizePricing } from './offering/entities/offer-size-pricing.entity';
import { OfferVipPricing } from './offering/entities/offer-vip-pricing.entity';
import { CheckinHistory } from './reservation/entities/checkin-history.entity';
import { PaymentSlip } from './reservation/entities/payment-slip.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite', // หรือ ':memory:' ถ้าต้องการ memory DB
      entities: [
        Dog,
        Breed,
        DogOwner,
        Health,
        VaccinationRecord,
        Reservation,
        ReservationLine,
        CheckinHistory,
        PaymentSlip,
        Offering,
        OfferBreedPricing,
        OfferSizePricing,
        OfferVipPricing,
      ],
      synchronize: true, // สร้างตารางอัตโนมัติ (ใช้เฉพาะตอน dev)
      logging: true,
    }),
    DogOwnerModule,
    ReservationModule,
    DogModule,
    UserModule,
    OfferingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
