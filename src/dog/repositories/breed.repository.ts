import { InjectRepository } from '@nestjs/typeorm';
import { Breed } from '../entities/breed.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BreedRepository {
  constructor(
    @InjectRepository(Breed)
    private readonly breedTypeOrmRepository: Repository<Breed>,
  ) {}

  initiate(breedObjectEntity: Partial<Breed>) : Breed {
    return this.breedTypeOrmRepository.create(breedObjectEntity)
  }

  async insert(breedObjectEntity: Breed){
    await this.breedTypeOrmRepository.save(breedObjectEntity)
  }

  async findAll(){
    return await this.breedTypeOrmRepository.find({relations:{size:true}})
  }

  async findById(id:number) {
    return await this.breedTypeOrmRepository.findOne({
      where:{
        id
      }
    })
  }
}
