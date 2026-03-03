import { Injectable } from '@nestjs/common';
import { DogOwner } from '../entities/dog-owner.entity';
import { DogOwnerRepository } from '../dog-owner.repository';

@Injectable()
export class GetDogOwnerByIdUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(id: number): Promise<DogOwner | null> {
    return this.dogOwnerRepository.findById(id);
  }
}
