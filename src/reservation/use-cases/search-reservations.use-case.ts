import { Injectable } from '@nestjs/common';
import { ReservationRepository } from '../reservation.repository';
import { Reservation } from '../entities/reservation.entity';
import { SearchReservationRequest } from '../dtos/search-reservation.dto';

@Injectable()
export class SearchReservationsUsecase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(query: SearchReservationRequest): Promise<Reservation[]> {
    return this.reservationRepository.searchAdvanced(query);
  }
}

