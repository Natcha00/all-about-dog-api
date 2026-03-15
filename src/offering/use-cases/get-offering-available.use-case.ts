import { Injectable } from '@nestjs/common';
import {
  BoardingDayAvailabilityDto,
  GetOfferingAvailableRequest,
  GetOfferingAvailableResponse,
  SwimmingDayAvailabilityDto,
} from '../dtos/get-offering-available.dto';
import { ReservationService } from 'src/reservation/reservation.service';
import { OfferingType } from '../enums/offering-type.enum';
import { BoardingCounter } from '../types/boarding-counter.type';
import { AssignDogs } from '../types/assign-dog.type';
import { BoardingSummary } from 'src/reservation/types/boarding-summary';

@Injectable()
export class GetOfferingAvailableUsecase {
  constructor(private readonly reservationService: ReservationService) {}

  private getDateRange(dateStr: string): { start: Date; end: Date } {
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    start.setHours(start.getHours() + 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  private async getBoardingAvailability(
    date: string,
  ): Promise<BoardingDayAvailabilityDto> {
    const { start, end } = this.getDateRange(date);
    const reservations = await this.reservationService.getReservationByPeriod(
      start,
      end,
      OfferingType.BOARDING,
    );

    const summaries =
      this.reservationService.summarizeBoardingByDate(reservations);
    const usedSummary = summaries.find((s) => s.date === date);
    const used: BoardingCounter =
      usedSummary?.boardingCounter ?? { LARGE: 0, SMALL: 0, VIP: 0 };

    const emptyAssignDogs: AssignDogs = new Map();
    const boardingSummaries: BoardingSummary[] = [
      { date, boardingCounter: used },
    ];
    const [detail] = this.reservationService.checkBoardingAvailability(
      emptyAssignDogs,
      boardingSummaries,
    );
    const left = detail.left;

    const total: BoardingCounter = {
      LARGE: used.LARGE + left.LARGE,
      SMALL: used.SMALL + left.SMALL,
      VIP: used.VIP + left.VIP,
    };

    return {
      date,
      used,
      left,
      total,
    };
  }

  private async getSwimmingAvailability(
    date: string,
  ): Promise<SwimmingDayAvailabilityDto> {
    const { start, end } = this.getDateRange(date);
    const reservations = await this.reservationService.getReservationByPeriod(
      start,
      end,
      OfferingType.SWIMMING,
    );
    const summaries =
      this.reservationService.summarizeSwimmingByHour(reservations);
    const slots = this.reservationService.checkSwimmingAvailability(summaries);
    return { date, slots };
  }

  async execute(
    request: GetOfferingAvailableRequest,
  ): Promise<GetOfferingAvailableResponse> {
    const boarding = await this.getBoardingAvailability(request.date);
    const swimming = await this.getSwimmingAvailability(request.date);
    return { boarding, swimming };
  }
}

