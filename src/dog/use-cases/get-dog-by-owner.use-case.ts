import { InjectRepository } from '@nestjs/typeorm';
import { DogRepository } from '../dog.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDogByOwnerUsecase {
  constructor(private readonly dogRepository: DogRepository) {}

  async execute(dogOwnerId: number) {
    return await this.dogRepository.findByDogOwner(dogOwnerId);
  }
}
