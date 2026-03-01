import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { CreateDogDto } from '../dtos/create-dog.dto';
import { DogOwnerService } from 'src/dog-owner/dog-owner.service';
import { BloodGroup } from '../enums/blood-group.enum';

@Injectable()
export class CreateDogUsecase {
  constructor(
    private readonly dogRepository: DogRepository,
    private readonly dogOwnerService: DogOwnerService,
  ) {}

  async execute(createDogDto: CreateDogDto, dogOwnerId: number) {
    const foundDogOwner = await this.dogOwnerService.getById(dogOwnerId);

    if (!foundDogOwner) {
      throw new NotFoundException('not found DogOwner');
    }
    const breed = await this.dogRepository.findBreedById(createDogDto.breedId);
    if (!breed) {
      throw new BadRequestException('Breed invalid');
    }

    const code = await this.dogRepository.getNextDogCode();

    const dog = this.dogRepository.create({
      code,
      name: createDogDto.name,
      gender: createDogDto.gender,
      breed: breed,
      dogOwner: foundDogOwner,
      color: createDogDto.color,
      weight: createDogDto.weight,
      height: createDogDto.height,
      birthdate: createDogDto.birthdate,
      ...(createDogDto.dogPictureUrl != null && {
        dogPictureUrl: createDogDto.dogPictureUrl,
      }),
      health: this.dogRepository.createHealth({
        sterilization: createDogDto.healthInfo.sterilization,
        microchip: createDogDto.healthInfo.microchip,
        bloodGroup: createDogDto.healthInfo.bloodGroup,
        underlyingDisease: createDogDto.healthInfo.underlyingDisease,
        allergy: createDogDto.healthInfo.allergy,
        hasBreakfast: createDogDto.healthInfo.hasBreakfast,
        hasAfterBreakfast: createDogDto.healthInfo.hasAfterBreakfast,
        hasLunch: createDogDto.healthInfo.hasLunch,
        hasAfterLunch: createDogDto.healthInfo.hasAfterLunch,
        hasDinner: createDogDto.healthInfo.hasDinner,
        detail: createDogDto.healthInfo.detail,
      }),
    });
    await this.dogRepository.save(dog);
    return;
  }
}
