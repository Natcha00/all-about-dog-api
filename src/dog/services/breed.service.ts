import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBreedDto } from '../dtos/create-breed.dto';
import { BreedRepository } from '../repositories/breed.repository';
import { SizeRepository } from '../repositories/size.repository';
@Injectable()
export class BreedService {
  constructor(
    private readonly breedRepository: BreedRepository,
    private readonly sizeRepository: SizeRepository,
  ) {}
  async create(createBreedDto: CreateBreedDto) {
    const size = await this.sizeRepository.findById(createBreedDto.sizeId);

    if (!!size) {
      const breed = this.breedRepository.initiate({
        nameTh: createBreedDto.nameTh,
        nameEng: createBreedDto.nameEng,
        size,
      });
      await this.breedRepository.insert(breed);
    } else {
      throw new BadRequestException('Size invalid');
    }
  }

  async getAll() {
    return await this.breedRepository.findAll()
  }
}
