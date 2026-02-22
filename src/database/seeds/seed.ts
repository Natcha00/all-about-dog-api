import 'reflect-metadata';
import { Breed } from 'src/dog/entities/breed.entity';
import { DataSource, In, MoreThan } from 'typeorm';
import { Dog } from 'src/dog/entities/dog.entity';
import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import { Health } from 'src/dog/entities/health.entity';
import { VaccinationRecord } from 'src/dog/entities/vaccination-record.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationLine } from 'src/reservation/entities/reservation-line.entity';
import { CheckinHistory } from 'src/reservation/entities/checkin-history.entity';
import { PaymentSlip } from 'src/reservation/entities/payment-slip.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';
import { OfferSizePricing } from 'src/offering/entities/offer-size-pricing.entity';
import { OfferVipPricing } from 'src/offering/entities/offer-vip-pricing.entity';
import breedData from '../data/breed.json';
import dogOwnerData from '../data/dog-owner.json';
import dogData from '../data/dog.json';
import offeringData from '../data/offering.json';
import offerBreedPricingData from '../data/offer_breed_pricing.json';
import offerSizePricingData from '../data/offer_size_pricing.json';
import offerVipPricingData from '../data/offer_vip_pricing.json';
import { Size } from 'src/dog/enums/size.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite', // ชื่อไฟล์ SQLite
  synchronize: true, // ❗ production ใช้ migration แทน
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
});

async function seedBreeds() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Breed);
  const breeds = repo.create(breedData as Breed[]); //breedData.map((b) => repo.create(b));
  await repo.save(breeds);
  console.log('🌱 SQLite breed seeding completed!');
  await AppDataSource.destroy();
}

async function seedDogOwner() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(DogOwner);
  const dogOwners = repo.create(dogOwnerData);
  await repo.save(dogOwners);
  console.log('🌱 SQLite dog owner seeding completed!');
  await AppDataSource.destroy();
}

async function seedDog() {
  await AppDataSource.initialize();
  const dogOwnerRepo = AppDataSource.getRepository(DogOwner);
  const breedRepo = AppDataSource.getRepository(Breed);
  const healthRepo = AppDataSource.getRepository(Health);
  const repo = AppDataSource.getRepository(Dog);
  const transform = dogData.map((dog) => ({
    ...dog,
    dogOwner: dogOwnerRepo.create({
      id: dog.dogOwner,
    }),
    breed: breedRepo.create({
      id: dog.breed,
    }),
    health: healthRepo.create(dog.health),
  }));
  const dogs = repo.create(transform);
  await repo.save(dogs);
  console.log('🌱 SQLite dogs seeding completed!');
  await AppDataSource.destroy();
}

async function seedOffering() {
  await AppDataSource.initialize();
  const offeringRepo = AppDataSource.getRepository(Offering);
  const offerBreedPricingRepo = AppDataSource.getRepository(OfferBreedPricing);
  const offerSizePricingRepo = AppDataSource.getRepository(OfferSizePricing);
  const offerVipPricingRepo = AppDataSource.getRepository(OfferVipPricing);
  const offeringTransform = offeringData.map((o)=>({
    ...o,
    offeringType:o.offeringType as OfferingType
  }))
  const offerBreedPricingTransform = offerBreedPricingData.map((op) => ({
    ...op,
    offering: {
      id: op.offeringId,
    },
    breed: {
      id: op.breedId,
    },
  }));

  const offerVipPricingTransform = offerVipPricingData.map((op) => ({
    ...op,
    offering: {
      id: op.offeringId,
    },
  }));

  const offerSizePricingTransform = offerSizePricingData.map((op) => ({
    ...op,
    size: op.size as Size,
    offering: {
      id: op.offeringId,
    },
  }));

  await offeringRepo.save(offeringTransform);
  await offerBreedPricingRepo.save(offerBreedPricingTransform);
  await offerVipPricingRepo.save(offerVipPricingTransform);
  await offerSizePricingRepo.save(offerSizePricingTransform);

  console.log('🌱 SQLite offering seeding completed!');
  await AppDataSource.destroy();
}

async function run() {
  const arg = process.argv[2]; // ตัวที่ส่งเข้ามา

  switch (arg) {
    case 'breeds':
      await seedBreeds();
      break;

    case 'dogOwners':
      await seedDogOwner();
      break;

    case 'dogs':
      await seedDog();
      break;

    case 'offerings':
      await seedOffering();
      break;

    default:
      await seedBreeds();
      await seedDogOwner();
      await seedDog();
      await seedOffering()
      console.log('🌱 SQLite seeding with no case!');
      break;
  }

  process.exit();
}

run();
