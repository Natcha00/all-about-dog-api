import { Injectable } from '@nestjs/common';
import { DogRepository } from '../dog.repository';

@Injectable()
export class GetBreedsUsecase {
  constructor(private readonly dogRepository: DogRepository) {}

  async execute() {
    return this.dogRepository.findAllBreeds();
  }
}
