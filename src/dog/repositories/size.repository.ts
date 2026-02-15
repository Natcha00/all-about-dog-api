import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Size } from '../entities/size.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SizeRepository {
  constructor(
    @InjectRepository(Size)
    private readonly sizeTypeORMRepository: Repository<Size>,
  ) {}

  initiate(sizeObjectEntity: Partial<Size>): Size {
    //Size of entity
    return this.sizeTypeORMRepository.create(sizeObjectEntity);
  }

  async insert(sizeObjectEntity: Size) {
    await this.sizeTypeORMRepository.save(sizeObjectEntity);
  }

  async findAll() {
    return await this.sizeTypeORMRepository.find({relations:{breeds:true}});
  }

  async findById(id: number) {
    return await this.sizeTypeORMRepository.findOne({
      where: {
        id,
      },
    });
  }
}
