import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DogOwnerRepository } from '../dog-owner.repository';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class RegisterDogOwnerUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(dto: RegisterDto): Promise<void> {
    const existing = await this.dogOwnerRepository.findOneByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Dog Owner already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const code = `DO-${Date.now().toString(36).toUpperCase()}`;
    const dogOwner = this.dogOwnerRepository.initiate({
      code,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber,
      address: dto.address ?? undefined,
      profilePictureUrl: dto.profilePictureUrl ?? undefined,
    });
    await this.dogOwnerRepository.insert(dogOwner);
  }
}
