import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDogDto } from '../dtos/create-dog.dto';
import { UpdateDogDto } from '../dtos/update-dog.dto';
import { DogRepository } from '../dog.repository';
import { CreateBreedDto } from '../dtos/create-breed.dto';
import { IUser } from 'src/user/interfaces/user.interface';
import { DogOwnerService } from 'src/dog-owner/dog-owner.service';
import { Dog } from '../entities/dog.entity';

@Injectable()
export class DogService {
  constructor(private readonly dogRepository: DogRepository) {}

  async getDogByIds(dogIds: Array<number>, dogOwnerId: number) {
    const ownDogs = await this.dogRepository.findByDogOwner(dogOwnerId);

    this.validateDog(dogIds, ownDogs); //validate for any dogs are not own!

    const result = this.fileredByDogIds(dogIds,ownDogs)

    return result
  }

  private validateDog(dogIds: Array<number>, dogs: Array<Dog>) {
    const validate = dogIds.every((di) => dogs.find((od) => od.id == di));

    if (!validate) {
      throw new BadRequestException(`some dog isn't owned by dog-owner`);
    }
  }

  private fileredByDogIds(dogIds: Array<number>, dogs: Array<Dog>) {
    return dogs.filter((d) => dogIds.includes(d.id));
  }
}
