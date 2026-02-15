import { Injectable } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';

@Injectable()
export class ReservationService {
    constructor(private readonly reservationRepository:ReservationRepository){}

    createReservation(){
        
    }
}
