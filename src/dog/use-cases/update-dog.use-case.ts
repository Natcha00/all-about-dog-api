import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { UpdateDogDto } from '../dtos/update-dog.dto';

@Injectable()
export class UpdateDogUsecase {
  constructor(private readonly dogRepository: DogRepository) {}

  async execute(dogId: number, updateDogDto: UpdateDogDto, dogOwnerId: number) {
    const dog = await this.dogRepository.findOneByIdWithRelations(dogId);

    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    if (dog.dogOwner?.id !== dogOwnerId) {
      throw new ForbiddenException('Dog does not belong to this owner');
    }

    if (updateDogDto.breedId != null) {
      const breed = await this.dogRepository.findBreedById(updateDogDto.breedId);
      if (!breed) {
        throw new BadRequestException('Breed invalid');
      }
      dog.breed = breed;
    }

    if (updateDogDto.name != null) dog.name = updateDogDto.name;
    if (updateDogDto.gender != null) dog.gender = updateDogDto.gender;
    if (updateDogDto.color != null) dog.color = updateDogDto.color;
    if (updateDogDto.coatType != null) dog.coatType = updateDogDto.coatType;
    if (updateDogDto.weight != null) dog.weight = updateDogDto.weight;
    if (updateDogDto.height != null) dog.height = updateDogDto.height;
    if (updateDogDto.birthdate != null) dog.birthdate = updateDogDto.birthdate;
    if (updateDogDto.dogPictureUrl !== undefined) {
      dog.dogPictureUrl = updateDogDto.dogPictureUrl ?? null;
    }

    if (updateDogDto.healthInfo != null && dog.health) {
      const h = updateDogDto.healthInfo;
      dog.health.sterilization = h.sterilization ?? dog.health.sterilization;
      dog.health.microchip = h.microchip ?? dog.health.microchip;
      if (h.bloodGroup !== undefined) dog.health.bloodGroup = h.bloodGroup ?? null;
      if (h.underlyingDisease !== undefined) dog.health.underlyingDisease = h.underlyingDisease ?? null;
      if (h.allergy !== undefined) dog.health.allergy = h.allergy ?? null;
      dog.health.hasBreakfast = h.hasBreakfast ?? dog.health.hasBreakfast;
      dog.health.hasAfterBreakfast = h.hasAfterBreakfast ?? dog.health.hasAfterBreakfast;
      dog.health.hasLunch = h.hasLunch ?? dog.health.hasLunch;
      dog.health.hasAfterLunch = h.hasAfterLunch ?? dog.health.hasAfterLunch;
      dog.health.hasDinner = h.hasDinner ?? dog.health.hasDinner;
      if (h.detail !== undefined) dog.health.detail = h.detail ?? null;
    }

    await this.dogRepository.save(dog);
  }
}
