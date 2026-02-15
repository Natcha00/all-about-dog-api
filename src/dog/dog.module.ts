import { Module } from '@nestjs/common';
import { DogService } from './services/dog.service';
import { DogController } from './dog.controller';
import { SizeService } from './services/size.service';
import { SizeRepository } from './repositories/size.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from './entities/size.entity';
import { DogRepository } from './repositories/dog.repository';
import { Breed } from './entities/breed.entity';
import { Dog } from './entities/dog.entity';
import { BreedRepository } from './repositories/breed.repository';
import { BreedService } from './services/breed.service';
import { Health } from './entities/health.entity';
import { VaccinationRecord } from './entities/vaccinationRecord.entity';
import { DogOwnerModule } from 'src/dog-owner/dog-owner.module';

@Module({
  imports: [TypeOrmModule.forFeature([Size,Breed,Dog, Health, VaccinationRecord]), DogOwnerModule],
  controllers: [DogController],
  providers: [DogService,SizeService,SizeRepository,DogRepository,BreedService, BreedRepository],
})
export class DogModule {}
