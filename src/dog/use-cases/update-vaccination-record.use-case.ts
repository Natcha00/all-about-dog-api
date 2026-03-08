import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { VaccinationRecord } from '../entities/vaccination-record.entity';
import { UpdateVaccinationRecordDto } from '../dtos/update-vaccination-record.dto';
import { UploadVaccinationEvidenceUsecase } from './upload-vaccination-evidence.use-case';

@Injectable()
export class UpdateVaccinationRecordUsecase {
  constructor(
    private readonly dogRepository: DogRepository,
    private readonly uploadVaccinationEvidenceUsecase: UploadVaccinationEvidenceUsecase,
  ) {}

  async execute(
    dogId: number,
    vaccinationId: number,
    dogOwnerId: number,
    dto: UpdateVaccinationRecordDto,
    file?: Express.Multer.File,
  ): Promise<VaccinationRecord> {
    const dog = await this.dogRepository.findOneByIdWithRelations(dogId);
    if (!dog) {
      throw new NotFoundException('Dog not found');
    }
    if (dog.dogOwner?.id !== dogOwnerId) {
      throw new ForbiddenException('Dog does not belong to this owner');
    }

    const record = await this.dogRepository.findVaccinationByIdAndDogId(
      vaccinationId,
      dogId,
    );
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }

    if (dto.vaccineName != null) record.vaccineName = dto.vaccineName;
    if (dto.vaccinationDate != null)
      record.vaccineDate = new Date(dto.vaccinationDate);
    if (dto.dose != null) record.dose = dto.dose;
    if (dto.clinicName !== undefined) record.clinicName = dto.clinicName ?? null;

    if (file?.buffer) {
      const { evidenceImageUrl } =
        await this.uploadVaccinationEvidenceUsecase.execute(file);
      record.evidenceImageUrl = evidenceImageUrl;
    }

    return await this.dogRepository.saveVaccination(record);
  }
}
