import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogRepository } from '../dog.repository';

@Injectable()
export class DeleteVaccinationRecordUsecase {
  constructor(private readonly dogRepository: DogRepository) {}

  async execute(
    dogId: number,
    vaccinationId: number,
    ownerId: number,
  ): Promise<void> {
    const dog = await this.dogRepository.findOneByIdWithRelations(dogId);
    if (!dog) {
      throw new NotFoundException('Dog not found');
    }
    if (dog.dogOwner?.id !== ownerId) {
      throw new ForbiddenException('Dog does not belong to this owner');
    }

    const record = await this.dogRepository.findVaccinationByIdAndDogId(
      vaccinationId,
      dogId,
    );
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }

    await this.dogRepository.softDeleteVaccination(vaccinationId);
  }
}
