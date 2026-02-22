import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dog } from './entities/dog.entity';
import { Repository } from 'typeorm';
import { Breed } from './entities/breed.entity';
import { Health } from './entities/health.entity';

@Injectable()
export class DogRepository {
  constructor(
    @InjectRepository(Dog)
    private readonly dogTypeormRepository: Repository<Dog>,
    @InjectRepository(Breed)
    private readonly breedTypeormRepository: Repository<Breed>,
    @InjectRepository(Health)
    private readonly healthTypeormRepository: Repository<Health>,
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
        }
      },
      relations:{
        breed:true,
        health:true
      }
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

  //health
  createHealth(healthObjectEntity: Partial<Health>):Health{
    return this.healthTypeormRepository.create(healthObjectEntity)
  }

}
