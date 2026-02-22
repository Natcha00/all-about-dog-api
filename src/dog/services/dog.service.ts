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

@Injectable()
export class DogService {
  constructor() {}
}
