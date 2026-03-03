import { IsDateString } from 'class-validator';
import { BoardingCounter } from '../types/boarding-counter.type';
import { Slot } from '../types/slot.type';

export class GetOfferingAvailableRequest {
  @IsDateString()
  date: string;
}

export class BoardingDayAvailabilityDto {
  date: string;
  used: BoardingCounter;
  left: BoardingCounter;
  total: BoardingCounter;
}

export class SwimmingDayAvailabilityDto {
  date: string;
  slots: Slot[];
}

export class GetOfferingAvailableResponse {
  boarding: BoardingDayAvailabilityDto;
  swimming: SwimmingDayAvailabilityDto;
}

