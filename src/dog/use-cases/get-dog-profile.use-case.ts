import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { Gender } from '../enums/gender.enum';
import { VaccinationRecord } from '../entities/vaccination-record.entity';
import { Dog } from '../entities/dog.entity';
import { GetDogProfileResponse } from '../dtos/get-dog-profile.dto';

@Injectable()
export class GetDogProfileUsecase {
  constructor(private readonly dogRepository: DogRepository) {}

  async execute(dogId: number, ownerId: number): Promise<GetDogProfileResponse> {
    const dog = await this.dogRepository.findOneByIdWithRelations(dogId);

    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    if (dog.dogOwner?.id !== ownerId) {
      throw new ForbiddenException('Dog does not belong to this owner');
    }

    return this.mapDogToProfile(dog);
  }

  private mapDogToProfile(dog: Dog): GetDogProfileResponse { 
    const h = dog.health;
    const ageLabel = this.getAgeLabel(dog.birthdate);
    const genderLabel = dog.gender === Gender.FEMALE ? 'เพศเมีย' : 'เพศผู้';

    const header = {
      petId: dog.id,
      displayName: dog.name,
      imageUrl: dog.dogPictureUrl,
      badges: {
        ...(h?.allergy && { alertLabel: `สิ่งที่แพ้: ${h.allergy}` }),
      },
      qr: {
        code: dog.code,
        imageCode: 'jpeg',
      },
    };
    const general = {
      name: dog.name,
      gender: genderLabel,
      age: ageLabel,
      weightKg: String(dog.weight),
      heightCm: String(dog.height),
      breed: dog.breed?.nameTh ?? dog.breed?.nameEng ?? '-',
      color: dog.color,
      size: this.mapSizeToLabel(dog.breed?.size),
      birthday: this.formatDate(dog.birthdate),
    };

    const careInfo = {
      sterilized: h?.sterilization ?? false,
      microchip: h?.microchip ?? false,
      bloodType: h?.bloodGroup ?? '-',
      disease: h?.underlyingDisease ?? 'ไม่มี',
      allergy: h?.allergy ?? 'ไม่มี',
      mealsPerDay: this.countMealsPerDay(h),
      feedingTime: {
        hasBreakfast: h?.hasBreakfast ?? false,
        hasAfterBreakfast: h?.hasAfterBreakfast ?? false,
        hasLunch: h?.hasLunch ?? false,
        hasAfterLunch: h?.hasAfterLunch ?? false,
        hasDinner: h?.hasDinner ?? false,
      },
    };

    const extraNote = h?.detail ?? null;
    
    const profile = {
      general,
      careInfo,
      extraNote
    };

    const vaccineList = (dog.vaccinationRecords ?? []).map((rec: VaccinationRecord) => ({
      date: this.formatDateThai(rec.vaccineDate),
      vaccineName: rec.vaccineName,
      dose: rec.dose,
      clinicName: rec.clinicName,
      evidenceImageUrl: rec.evidenceImageUrl ?? '',
    }));

    const vaccine = {
      vaccineList,
    }
    return {
      header,
      profile,
      vaccine,
      serviceHistory: {
        swimmingHistoryList: [],
        boardingHistoryList: [],
      },
    };
  }

  private getAgeLabel(birthdate: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(birthdate).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (years <= 0 && months <= 0) return 'อายุไม่ถึง 1 เดือน';
    if (years <= 0) return `อายุ ${months} เดือน`;
    if (months <= 0) return `อายุ ${years} ปี`;
    return `อายุ ${years} ปี ${months} เดือน`;
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  /** Format for vaccine date display e.g. "20 ธ.ค. 2568" */
  private formatDateThai(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }

  private countMealsPerDay(health: any): number {
    if (!health) return 0;
    const flags = [
      health.hasBreakfast,
      health.hasAfterBreakfast,
      health.hasLunch,
      health.hasAfterLunch,
      health.hasDinner,
    ];
    return flags.filter(Boolean).length;
  }

  private mapSizeToLabel(size?: string): string {
    if (!size) return '-';
    if (size === 'small') return 'เล็ก';
    if (size === 'large') return 'ใหญ่';
    return size;
  }
}