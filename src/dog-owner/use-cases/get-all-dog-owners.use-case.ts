import { Injectable } from '@nestjs/common';
import { DogOwner } from '../entities/dog-owner.entity';
import { DogOwnerRepository } from '../dog-owner.repository';

@Injectable()
export class GetAllDogOwnersUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(): Promise<DogOwner[]> {
    return this.dogOwnerRepository.findAll();
  }

}
