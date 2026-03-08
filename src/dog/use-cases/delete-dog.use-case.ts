import { Injectable, NotFoundException } from '@nestjs/common';
import { DogRepository } from '../dog.repository';

@Injectable()
export class DeleteDogUsecase {
  constructor(private readonly dogRepository: DogRepository) {}

  async execute(dogId: number, dogOwnerId: number): Promise<void> {
    const dog = await this.dogRepository.findOneByIdAndDogOwnerId(
      dogId,
      dogOwnerId,
    );
    if (!dog) {
      throw new NotFoundException('ไม่พบข้อมูลสุนัข');
    }
    await this.dogRepository.softDeleteDog(dogId);
  }
}
