import { OfferingService } from 'src/offering/offering.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { GetOfferingSummaryRequest, GetOfferingSummaryResponse } from '../dtos/get-offering-summary.dto';
import { Injectable } from '@nestjs/common';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationLine } from 'src/reservation/entities/reservation-line.entity';

@Injectable()
export class GetOfferingSummaryUsecase {
  constructor(private readonly reservationService: ReservationService) {}

  async execute(request: GetOfferingSummaryRequest) {
    const reservations = await this.reservationService.getReservationByPeriod(
      new Date(request.start),
      new Date(request.end),
      request.offeringType,
    );

    return this.transform(reservations);
  }

  transform(reservations: Reservation[]) {
    return reservations.reduce((acc: GetOfferingSummaryResponse[], reservation) => {
      const reservationLine = reservation.reservationLines.map(
        (line: ReservationLine) => {
          return {
            code: reservation.code,
            status: reservation.status,
            startDateTime: reservation.startDateTime,
            endDateTime: reservation.endDateTime,
            remark: reservation.remark,
            offeringType: reservation.offeringType,
            price: line.price,
            quantity: line.quantity,
            groupNumber: line.groupNumber,
            buildingName: line.offering.name,
            isVip: line.offering.isVip,
            dogName: line.dog.name,
            dogBreed: line.dog.breed.nameTh,
            dogSize: line.dog.breed.size,
            dogCoat: line.dog.coatType,
            dogOwnerName:
              reservation.dogOwner.firstName +
              ' ' +
              reservation.dogOwner.lastName,
          };
        },
      );
      
      acc.push(...reservationLine);
      return acc;
    }, []).flat();
  }
}
