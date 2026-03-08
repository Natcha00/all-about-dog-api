import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { VaccinationRecord } from '../entities/vaccination-record.entity';
import { CreateVaccinationRecordDto } from '../dtos/create-vaccination-record.dto';
import { UploadVaccinationEvidenceUsecase } from './upload-vaccination-evidence.use-case';

@Injectable()
export class CreateVaccinationRecordUsecase {
  constructor(
    private readonly dogRepository: DogRepository,
    private readonly uploadVaccinationEvidenceUsecase: UploadVaccinationEvidenceUsecase,
  ) {}

  async execute(
    dogId: number,
    ownerId: number,
    dto: CreateVaccinationRecordDto,
    file?: Express.Multer.File,
  ): Promise<VaccinationRecord> {
    const dog = await this.dogRepository.findOneByIdWithRelations(dogId);

    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    if (dog.dogOwner?.id !== ownerId) {
      throw new ForbiddenException('Dog does not belong to this owner');
    }

    let evidenceImageUrl: string | null = null;
    if (file?.buffer) {
      const { evidenceImageUrl: url } =
        await this.uploadVaccinationEvidenceUsecase.execute(file);
      evidenceImageUrl = url;
    }

    const record = this.dogRepository.createVaccination({
      vaccineName: dto.vaccineName,
      clinicName: dto.clinicName ?? null,
      dose: dto.dose,
      evidenceImageUrl,
      vaccineDate: new Date(dto.vaccinationDate),
      dog,
    });

    return await this.dogRepository.saveVaccination(record);
  }
}