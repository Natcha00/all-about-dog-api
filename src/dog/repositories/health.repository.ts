import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Health } from '../entities/health.entity';
import { Repository } from 'typeorm';

@Injectable()
export class healthRepository {
  constructor(
    @InjectRepository(Health)
    private readonly healthTypeOrmRepository: Repository<Health>,
  ) {}

  initiate(dogObjectEntity: Partial<Health>): Health {
    return this.healthTypeOrmRepository.create(dogObjectEntity);
  }
  async insert(dogObjectEntity: Health) {
    await this.healthTypeOrmRepository.save(dogObjectEntity);
  }
}
