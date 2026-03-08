import { Injectable, NotFoundException } from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';
import { DogOwnerProfileResponse } from '../dtos/get-dog-owner-profile.dto';

@Injectable()
export class GetDogOwnerProfileUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(dogOwnerId: number): Promise<DogOwnerProfileResponse> {
    const owner = await this.dogOwnerRepository.findById(dogOwnerId);
    if (!owner) {
      throw new NotFoundException('ไม่พบข้อมูลโปรไฟล์');
    }
    return {
      id: owner.id,
      code: owner.code,
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email ?? null,
      phoneNumber: owner.phoneNumber,
      address: owner.address ?? null,
      profilePictureUrl: owner.profilePictureUrl ?? null,
      isEmailVerified: owner.isEmailVerified,
    };
  }
}
