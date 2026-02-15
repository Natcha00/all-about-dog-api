import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateDogDto } from '../dtos/create-dog.dto';
import { UpdateDogDto } from '../dtos/update-dog.dto';
import { DogRepository } from '../repositories/dog.repository';
import { BreedRepository } from '../repositories/breed.repository';
import { CreateBreedDto } from '../dtos/create-breed.dto';
import { IUser } from 'src/user/interfaces/user.interface';
import { DogOwnerService } from 'src/dog-owner/dog-owner.service';

@Injectable()
export class DogService {
  constructor(
    private readonly dogRepository: DogRepository,
    private readonly breedRepository: BreedRepository,
    private readonly dogOwnerService: DogOwnerService
    ) {}
  async create(createDogDto: CreateDogDto, dogOwnerDec:IUser) {
    const foundDogOwner = await this.dogOwnerService.getById(dogOwnerDec.id)
    if (!foundDogOwner) {
      throw new NotFoundException("not found DogOwner")
    }
    const breed = await this.breedRepository.findById(createDogDto.breedId)
    console.log(breed);
    if (!!breed) {
      const dog = this.dogRepository.initiate({
        name: createDogDto.name,
        gender: createDogDto.gender,
        breed: breed,
        dogOwner:foundDogOwner,
        color: createDogDto.color,
        weight: createDogDto.weight,
        height: createDogDto.height,
        birthdate: createDogDto.birthdate,
    })
    await this.dogRepository.insert(dog);
    } else {
      throw new BadRequestException('Breed invalid');
    }
  }

  findAll() {
    return `This action returns all dog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dog`;
  }

  update(id: number, updateDogDto: UpdateDogDto) {
    return `This action updates a #${id} dog`;
  }

  remove(id: number) {
    return `This action removes a #${id} dog`;
  }
}
