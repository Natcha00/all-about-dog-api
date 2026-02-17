import { Module } from '@nestjs/common';
import { DogService } from './services/dog.service';
import { DogController } from './dog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogRepository } from './repositories/dog.repository';
import { Breed } from './entities/breed.entity';
import { Dog } from './entities/dog.entity';
import { BreedRepository } from './repositories/breed.repository';
import { BreedService } from './services/breed.service';
import { Health } from './entities/health.entity';
import { VaccinationRecord } from './entities/vaccination-record.entity';
import { DogOwnerModule } from 'src/dog-owner/dog-owner.module';

@Module({
  imports: [TypeOrmModule.forFeature([Breed,Dog, Health, VaccinationRecord]), DogOwnerModule],
  controllers: [DogController],
  providers: [DogService,DogRepository,BreedService, BreedRepository],
})
export class DogModule {}
