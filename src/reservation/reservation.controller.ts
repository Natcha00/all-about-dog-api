import { Body, Controller, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  createReservation(@Body() reservationBody:Reservation){
    // return this.reservationService.createReservation(reservationBody)
  }

}
