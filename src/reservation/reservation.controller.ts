import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { ConfirmReservationRequest } from './dtos/confirm-reservation.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  createReservation(@Body() reservationBody: Reservation) {
    // return this.reservationService.createReservation(reservationBody)
  }

  @Post('confirm')
  @UseGuards(AccessTokenGuard)
  async confirm(
    @Body() body: ConfirmReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<Reservation> {
    return this.reservationService.confirmReservation(body, user.id);
  }
}
