import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { ReservationService } from 'src/reservation/reservation.service';

@Injectable()
export class DeleteDogUsecase {
  constructor(
    private readonly dogRepository: DogRepository,
    private readonly reservationService: ReservationService,
  ) {}

  async execute(dogId: number, dogOwnerId: number): Promise<void> {
    const dog = await this.dogRepository.findOneByIdAndDogOwnerId(
      dogId,
      dogOwnerId,
    );
    if (!dog) {
      throw new NotFoundException('ไม่พบข้อมูลสุนัข');
    }

    const hasReservationHistory =
      await this.reservationService.hasDogReservationHistory(
        dogId,
        dogOwnerId,
      );

    if (hasReservationHistory) {
      throw new BadRequestException(
        'ไม่สามารถลบสุนัขที่เคยมีประวัติการจองได้',
      );
    }

    await this.dogRepository.softDeleteDog(dogId);
  }
}
