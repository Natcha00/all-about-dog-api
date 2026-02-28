import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { DogRepository } from '../dog.repository';
  import { VaccinationRecord } from '../entities/vaccination-record.entity';
  import { CreateVaccinationRecordDto } from '../dtos/create-vaccination-record.dto';
  
  @Injectable()
  export class CreateVaccinationRecordUsecase {
    constructor(
      private readonly dogRepository: DogRepository
    ) {}
  
    async execute(
      dogId: number,
      ownerId: number,
      CreateVaccinationRecordDto: CreateVaccinationRecordDto,
    ) {
      const dog = await this.dogRepository.findOneByIdWithRelations(dogId);
  
      if (!dog) {
        throw new NotFoundException('Dog not found');
      }
  
      if (dog.dogOwner?.id !== ownerId) {
        throw new ForbiddenException('Dog does not belong to this owner');
      }
  
      const record = this.dogRepository.createVaccination({
        vaccineName: CreateVaccinationRecordDto.vaccineName,
        clinicName: CreateVaccinationRecordDto.clinicName,
        dose: CreateVaccinationRecordDto.dose,
        evidenceImageUrl: CreateVaccinationRecordDto.evidenceImageUrl,
        vaccineDate: new Date(CreateVaccinationRecordDto.vaccinationDate),
        dog,
      });
  
      await this.dogRepository.saveVaccination(record);
      return ;
    }
  }