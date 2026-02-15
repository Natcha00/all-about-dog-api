import { Injectable } from '@nestjs/common';
import { DogOwner } from './entities/dog-owner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DogOwnerRepository {
  constructor(
    @InjectRepository(DogOwner)
    private readonly dogOwnerRepository: Repository<DogOwner>,
  ) {}
  initiate(dogOwnerObjectEntity: Partial<DogOwner>): DogOwner {
    return this.dogOwnerRepository.create(dogOwnerObjectEntity);
  }

  async insert(dogOwnerObjectEntity: DogOwner) {
    await this.dogOwnerRepository.save(dogOwnerObjectEntity);
  }
  async findAll() {
    return await this.dogOwnerRepository.find();
  }

  async findById(id:number){
    return await this.dogOwnerRepository.findOne({
      where:{
        id
      }
    })
  }

  async findOneByEmail(email: string) {
    return await this.dogOwnerRepository.findOne({
      where: {
        email
      },
    });
  }
}
