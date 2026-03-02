import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dog } from './entities/dog.entity';
import { Repository } from 'typeorm';
import { Breed } from './entities/breed.entity';
import { Health } from './entities/health.entity';
import { VaccinationRecord } from './entities/vaccination-record.entity';

@Injectable()
export class DogRepository {
  constructor(
    @InjectRepository(Dog)
    private readonly dogTypeormRepository: Repository<Dog>,
    @InjectRepository(Breed)
    private readonly breedTypeormRepository: Repository<Breed>,
    @InjectRepository(Health)
    private readonly healthTypeormRepository: Repository<Health>,
    @InjectRepository(VaccinationRecord)
    private readonly vaccinationRepository: Repository<VaccinationRecord>,
  ) {}

  create(dogObjectEntity: Partial<Dog>): Dog {
    return this.dogTypeormRepository.create(dogObjectEntity);
  }
  async save(dogObjectEntity: Dog) {
    return await this.dogTypeormRepository.save(dogObjectEntity);
  }

  async findByDogOwner(dogOwnerId: number) {
    return this.dogTypeormRepository.find({
      where: {
        dogOwner: {
          id: dogOwnerId,
        },
      },
      relations: {
        breed: true,
        health: true,
      },
    });
  }

  async find() {
    await this.dogTypeormRepository.find();
  }

  //breed
  async findBreedById(breedId: number) {
    return this.breedTypeormRepository.findOne({
      where: {
        id: breedId,
      },
    });
  }

  async findAllBreeds() {
    return this.breedTypeormRepository.find({
      select: ['id', 'nameTh', 'nameEng', 'size'],
      order: { id: 'ASC' },
    });
  }

  /** Generate next dog code in format DG-YYMMDD-NNNN (year/month/day, e.g. DG-260227-0001) */
  async getNextDogCode(): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear() % 100).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePart = `${yy}${mm}${dd}`;
    const prefix = `DG-${datePart}-`;

    const existing = await this.dogTypeormRepository
      .createQueryBuilder('dog')
      .select('dog.code')
      .where('dog.code LIKE :prefix', { prefix: `${prefix}%` })
      .getMany();

    let nextSeq = 1;
    for (const row of existing) {
      const seq = parseInt(row.code.slice(-4), 10);
      if (!isNaN(seq) && seq >= nextSeq) nextSeq = seq + 1;
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  //health
  createHealth(healthObjectEntity: Partial<Health>): Health {
    return this.healthTypeormRepository.create(healthObjectEntity);
  }

  async findOneByIdWithRelations(dogId: number) {
    return this.dogTypeormRepository.findOne({
      where: {
        id: dogId,
      },
      relations: {
        dogOwner: true,
        breed: true,
        health: true,
        vaccinationRecords: true,
      },
    });
  }
  createVaccination(
    VaccinationObjectEntity: Partial<VaccinationRecord>,
  ): VaccinationRecord {
    return this.vaccinationRepository.create(VaccinationObjectEntity);
  }

  async saveVaccination(VaccinationObjectEntity: VaccinationRecord) {
    return this.vaccinationRepository.save(VaccinationObjectEntity);
  }
}
