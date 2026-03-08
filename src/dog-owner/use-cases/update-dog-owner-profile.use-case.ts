import { Injectable, NotFoundException } from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';
import { UpdateDogOwnerProfileDto } from '../dtos/update-dog-owner-profile.dto';
import { DogOwnerProfileResponse } from '../dtos/get-dog-owner-profile.dto';

@Injectable()
export class UpdateDogOwnerProfileUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(
    dogOwnerId: number,
    dto: UpdateDogOwnerProfileDto,
  ): Promise<DogOwnerProfileResponse> {
    const owner = await this.dogOwnerRepository.findById(dogOwnerId);
    if (!owner) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');
    }

    if (dto.firstName !== undefined) owner.firstName = dto.firstName;
    if (dto.lastName !== undefined) owner.lastName = dto.lastName;
    if (dto.phoneNumber !== undefined) owner.phoneNumber = dto.phoneNumber;
    if (dto.address !== undefined) owner.address = dto.address;

    await this.dogOwnerRepository.insert(owner);

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
