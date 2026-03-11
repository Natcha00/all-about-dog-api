import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import '../../set-timezone';
import { Breed } from 'src/dog/entities/breed.entity';
import { DataSource, In, MoreThan } from 'typeorm';
import { Dog } from 'src/dog/entities/dog.entity';
import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import { Health } from 'src/dog/entities/health.entity';
import { VaccinationRecord } from 'src/dog/entities/vaccination-record.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationLine } from 'src/reservation/entities/reservation-line.entity';
import { ReservationStatusLog } from 'src/reservation/entities/reservation-status-log.entity';
import { CheckinHistory } from 'src/reservation/entities/checkin-history.entity';
import { PaymentSlip } from 'src/reservation/entities/payment-slip.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';
import { OfferSizePricing } from 'src/offering/entities/offer-size-pricing.entity';
import { OfferVipPricing } from 'src/offering/entities/offer-vip-pricing.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import * as bcrypt from 'bcrypt';
import breedData from '../data/breed.json';
import dogOwnerData from '../data/dog-owner.json';
import dogData from '../data/dog.json';
import offeringData from '../data/offering.json';
import offerBreedPricingData from '../data/offer_breed_pricing.json';
import offerSizePricingData from '../data/offer_size_pricing.json';
import offerVipPricingData from '../data/offer_vip_pricing.json';
import offerCoatPricingData from '../data/offer_coat_pricing.json';
import reservationData from '../data/reservation.json';
import { Size } from 'src/dog/enums/size.enum';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';
import { ROLE } from 'src/user/enums/role.enum';
import { faker } from '@faker-js/faker';
import { OfferCoatPricing } from 'src/offering/entities/offer-coat-pricing.entity';
import { CoatType } from 'src/dog/enums/coat-type.enum';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'app',
  password: process.env.DB_PASSWORD ?? 'app',
  database: process.env.DB_DATABASE ?? 'all_about_dog',
  synchronize: true, // ❗ production ใช้ migration แทน
  entities: [
    Dog,
    Breed,
    DogOwner,
    Health,
    VaccinationRecord,
    Reservation,
    ReservationLine,
    ReservationStatusLog,
    CheckinHistory,
    PaymentSlip,
    Offering,
    OfferBreedPricing,
    OfferSizePricing,
    OfferVipPricing,
    OfferCoatPricing,
    Staff,
  ],
});

async function seedBreeds() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Breed);
  const breeds = repo.create(breedData as Breed[]); //breedData.map((b) => repo.create(b));
  await repo.save(breeds);
  console.log('🌱 MySQL breed seeding completed!');
  await AppDataSource.destroy();
}

async function seedDogOwner() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(DogOwner);
  const dogOwners = repo.create(dogOwnerData);
  await repo.save(dogOwners);
  console.log('🌱 MySQL dog owner seeding completed!');
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
    health: healthRepo.create(dog.health as Health),
  }));
  const dogs = repo.create(transform);
  await repo.save(dogs);
  console.log('🌱 MySQL dogs seeding completed!');
  await AppDataSource.destroy();
}

async function seedOffering() {
  await AppDataSource.initialize();
  const offeringRepo = AppDataSource.getRepository(Offering);
  const offerBreedPricingRepo = AppDataSource.getRepository(OfferBreedPricing);
  const offerSizePricingRepo = AppDataSource.getRepository(OfferSizePricing);
  const offerVipPricingRepo = AppDataSource.getRepository(OfferVipPricing);
  const offeringTransform = offeringData.map((o) => ({
    ...o,
    offeringType: o.offeringType as OfferingType,
  }));
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

  console.log('🌱 MySQL offering seeding completed!');
  await AppDataSource.destroy();
}

async function seedOfferCoatPricing() {
  await AppDataSource.initialize();
  const offerCoatPricingRepo = AppDataSource.getRepository(OfferCoatPricing);
  const offerCoatPricingTransform = offerCoatPricingData.map((op) => ({
    ...op,
    offering: { id: op.offeringId },
    coat: op.coat as CoatType,
  }));
  await offerCoatPricingRepo.save(offerCoatPricingTransform);
  console.log('🌱 MySQL offer coat pricing seeding completed!');
  await AppDataSource.destroy();
}

async function seedStaff() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Staff);
  const hashedPassword = await bcrypt.hash('password123', 10);

  const staffList = [
    {
      username: 'staff01',
      password: hashedPassword,
      email: 'staff@example.com',
      firstName: 'Staff',
      lastName: 'One',
      phoneNumber: '0812345678',
      role: ROLE.STAFF,
    },
    {
      username: 'admin01',
      password: hashedPassword,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '0898765432',
      role: ROLE.ADMIN,
    },
  ];

  const entities = repo.create(staffList);
  await repo.save(entities);
  console.log('🌱 MySQL staff seeding completed!');
  await AppDataSource.destroy();
}

async function seedReservation() {
  await AppDataSource.initialize();

  const dogOwnerRepo = AppDataSource.getRepository(DogOwner);
  const breedRepo = AppDataSource.getRepository(Breed);
  const healthRepo = AppDataSource.getRepository(Health);
  const dogRepo = AppDataSource.getRepository(Dog);
  const reservationRepo = AppDataSource.getRepository(Reservation);

  const breedIds = (await breedRepo.find({ select: ['id'] })).map((b) => b.id);
  if (breedIds.length === 0) {
    throw new Error('Run seedBreeds first.');
  }

  // 1. สร้าง Dog Owner ด้วย Faker (ไม่อ้างอิงจาก json)
  const ownerCount = 4;
  const fakeOwners = Array.from({ length: ownerCount }, (_, i) => ({
    code: `DO-${faker.date.recent().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 8 }),
    phoneNumber: faker.phone.number(),
    address: faker.location.streetAddress(),
    profilePictureUrl: faker.image.avatar(),
  }));
  const savedOwners = await dogOwnerRepo.save(dogOwnerRepo.create(fakeOwners));
  console.log('🌱 Dog owners (Faker) seeded for reservation');

  // 2. สร้าง Dog ด้วย Faker แต่ละ owner มี 1–3 dogs (อ้างอิง breed จาก DB, size => offering: large=1, small=2)
  const dogsPerOwner = [2, 3, 2, 2]; // จำนวน dog ต่อ owner
  const dogPayloads: Array<{
    code: string;
    name: string;
    gender: string;
    color: string;
    weight: number;
    height: number;
    birthdate: Date;
    dogPictureUrl: string;
    dogOwnerId: number;
    breedId: number;
    health: Record<string, unknown>;
  }> = [];
  const colors = [
    'orange',
    'brown',
    'white',
    'black',
    'gray',
    'cream',
    'golden',
    'tan',
  ];
  const bloodGroups = [
    'DEA 1.1',
    'DEA 1.2',
    'DEA 3',
    'DEA 4',
    'DEA 5',
    'DEA 6',
    'DEA 7',
    'DEA 8',
    'UNKNOWN',
  ];

  let dogIndex = 0;
  for (let o = 0; o < savedOwners.length; o++) {
    const ownerId = savedOwners[o].id;
    const count = dogsPerOwner[o] ?? 1;
    for (let d = 0; d < count; d++) {
      dogIndex++;
      dogPayloads.push({
        code: `DG-${faker.date.recent().toISOString().slice(0, 10).replace(/-/g, '')}-${String(dogIndex).padStart(4, '0')}`,
        name: faker.animal.dog(),
        gender: faker.helpers.arrayElement(['male', 'female']),
        color: faker.helpers.arrayElement(colors),
        weight: faker.number.int({ min: 4, max: 35 }),
        height: faker.number.int({ min: 22, max: 100 }),
        birthdate: faker.date.past({ years: 10 }),
        dogPictureUrl: faker.image.url(),
        dogOwnerId: ownerId,
        breedId: faker.helpers.arrayElement(breedIds),
        health: {
          detail: faker.helpers.maybe(() => faker.lorem.sentence(), {
            probability: 0.3,
          }),
          sterilization: faker.datatype.boolean(),
          microchip: faker.datatype.boolean(),
          underlyingDisease: faker.helpers.maybe(() => faker.lorem.words(2), {
            probability: 0.2,
          }),
          allergy: faker.helpers.maybe(
            () =>
              faker.helpers.arrayElement([
                'peanut',
                'chicken',
                'beef',
                'wheat',
                'fish',
                'soy',
                'dust',
              ]),
            { probability: 0.3 },
          ),
          bloodGroup: faker.helpers.arrayElement(bloodGroups),
          hasBreakfast: faker.datatype.boolean(),
          hasAfterBreakfast: faker.datatype.boolean(),
          hasLunch: faker.datatype.boolean(),
          hasAfterLunch: faker.datatype.boolean(),
          hasDinner: faker.datatype.boolean(),
        },
      });
    }
  }

  const savedDogs: Array<{ id: number; dogOwnerId: number }> = [];
  for (const p of dogPayloads) {
    const { dogOwnerId, breedId, health, ...dogFields } = p;
    const dog = await dogRepo.save(
      dogRepo.create({
        ...dogFields,
        dogOwner: dogOwnerRepo.create({ id: dogOwnerId }),
        breed: breedRepo.create({ id: breedId }),
        health: healthRepo.create(health as object),
      }),
    );
    savedDogs.push({ id: dog.id, dogOwnerId });
  }
  console.log('🌱 Dogs (Faker) seeded for reservation');

  // 3. สร้าง Reservation จากข้อมูลที่ generate (owner + dogs ของ owner)
  // ReservationLine เป็น OneToOne กับ Offering และ OneToOne กับ Dog → แต่ละ offering และแต่ละ dog ใช้ได้แค่ 1 line ในทั้งระบบ
  const offeringRepo = AppDataSource.getRepository(Offering);
  const offerings = await offeringRepo.find({
    where: { offeringType: OfferingType.BOARDING },
    order: { id: 'ASC' },
  });
  const price = 1000;

  const reservationsToSave: Array<{
    code: string;
    status: ReservationStatusEnum;
    startDateTime: Date;
    endDateTime: Date;
    remark: string;
    offeringType: OfferingType;
    dogOwner: { id: number };
    reservationLines: Array<{
      price: number;
      quantity: number;
      groupNumber: number;
      offering: { id: number };
      dog: { id: number };
    }>;
  }> = [];

  const count = Math.min(offerings.length, savedDogs.length);
  for (let i = 0; i < count; i++) {
    const offering = offerings[i];
    const dog = savedDogs[i];
    const ownerId = dog.dogOwnerId;
    const start = faker.date.soon({ days: 5 });
    const end = faker.date.soon({ days: 10 });
    reservationsToSave.push({
      code: `RSV-${faker.date.recent().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
      status: ReservationStatusEnum.SLIP_VERIFIED,
      startDateTime: start,
      endDateTime: end,
      remark: '',
      offeringType: OfferingType.BOARDING,
      dogOwner: { id: ownerId },
      reservationLines: [
        {
          price,
          quantity: 1,
          groupNumber: 1,
          offering: { id: offering.id },
          dog: { id: dog.id },
        },
      ],
    });
  }

  await reservationRepo.save(reservationsToSave);
  console.log('🌱 MySQL reservation seeding completed!');
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

    case 'reservations':
      // ต้อง run breeds + offerings มาก่อน (เช่น npm run seed) แล้วค่อย run seed:reservations
      await seedReservation();
      break;

    case 'staff':
      await seedStaff();
      break;

    case 'offerCoatPricing':
      await seedOfferCoatPricing();
      break;

    default:
      // await seedBreeds();
      // await seedDogOwner();
      // await seedDog();
      // await seedOffering();
      // await seedStaff();
      console.log('🌱 MySQL seeding with no case!');
      break;
  }

  process.exit();
}

run();
