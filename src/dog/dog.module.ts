import { Module } from '@nestjs/common';
import { DogService } from './services/dog.service';
import { DogController } from './dog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogRepository } from './dog.repository';
import { Breed } from './entities/breed.entity';
import { Dog } from './entities/dog.entity';
import { Health } from './entities/health.entity';
import { VaccinationRecord } from './entities/vaccination-record.entity';
import { DogOwnerModule } from 'src/dog-owner/dog-owner.module';
import { GetDogByOwnerUsecase } from './use-cases/get-dog-by-owner.use-case';
import { CreateDogUsecase } from './use-cases/create-dog.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Breed, Dog, Health, VaccinationRecord]),
    DogOwnerModule,
  ],
  controllers: [DogController],
  providers: [
    DogService,
    DogRepository,
    GetDogByOwnerUsecase,
    CreateDogUsecase,
  ],
  exports:[DogService]
})
export class DogModule {}
