import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dog } from '../entities/dog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DogRepository {
  constructor(
    @InjectRepository(Dog)
    private readonly dogTypeOrmRepository: Repository<Dog>
  ) {}

  initiate(dogObjectEntity: Partial<Dog>): Dog {
    return this.dogTypeOrmRepository.create(dogObjectEntity);
  }
  async insert(dogObjectEntity: Dog) {
    return await this.dogTypeOrmRepository.save(dogObjectEntity);
  }
  async find() {
    await this.dogTypeOrmRepository.find();
  }
}
