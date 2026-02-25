import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DogOwner } from "src/dog-owner/entities/dog-owner.entity";
import { Breed } from "src/dog/entities/breed.entity";
import { Dog } from "src/dog/entities/dog.entity";
import { Health } from "src/dog/entities/health.entity";
import { VaccinationRecord } from "src/dog/entities/vaccination-record.entity";
import { OfferBreedPricing } from "src/offering/entities/offer-breed-pricing.entity";
import { OfferSizePricing } from "src/offering/entities/offer-size-pricing.entity";
import { OfferVipPricing } from "src/offering/entities/offer-vip-pricing.entity";
import { Offering } from "src/offering/entities/offering.entity";
import { CheckinHistory } from "src/reservation/entities/checkin-history.entity";
import { PaymentSlip } from "src/reservation/entities/payment-slip.entity";
import { ReservationLine } from "src/reservation/entities/reservation-line.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";

@Module({
    imports: [
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
            logging: false,
          }),
    ]
})
export class DatabaseModule {}