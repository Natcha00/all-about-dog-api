import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBreedDto } from '../dtos/create-breed.dto';
import { BreedRepository } from '../repositories/breed.repository';

@Injectable()
export class BreedService {
  constructor(
    private readonly breedRepository: BreedRepository
  ) {}
  async create(createBreedDto: CreateBreedDto) {
    
  }

  async getAll() {
    return await this.breedRepository.findAll()
  }
}
