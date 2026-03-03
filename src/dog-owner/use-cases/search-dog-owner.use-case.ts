import { Injectable } from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';
import { SearchDogOwnerItemDto } from '../dtos/search-dog-owner.dto';

@Injectable()
export class SearchDogOwnerUsecase {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

  async execute(keyword: string): Promise<SearchDogOwnerItemDto[]> {
    const owners = await this.dogOwnerRepository.searchByKeyword(keyword);
    return owners.map((o) => ({
      id: o.id,
      code: o.code,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phoneNumber: o.phoneNumber,
      address: o.address ?? null,
      profilePictureUrl: o.profilePictureUrl ?? null,
    }));
  }
}
