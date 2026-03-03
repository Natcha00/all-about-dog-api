import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DogOwnerRepository } from '../dog-owner.repository';
import { CreateDogOwnerDto } from '../dtos/create-dog-owner.dto';

@Injectable()
export class CreateDogOwnerUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(dto: CreateDogOwnerDto): Promise<void> {
    const code = `DO-${Date.now().toString(36).toUpperCase()}`;
    const password = await bcrypt.hash(`temp-${Date.now()}`, 10);
    const dogOwner = this.dogOwnerRepository.initiate({
      code,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
    });
    await this.dogOwnerRepository.insert(dogOwner);
  }
}
