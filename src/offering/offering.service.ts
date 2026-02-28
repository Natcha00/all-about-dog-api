import { Injectable } from '@nestjs/common';

/**
 * Reservation-related logic (assignDogs, boardingSummary, countByRange,
 * checkBoardingAvailability, checkSwimmingAvailability) has been moved to
 * ReservationService. This class is kept for backward compatibility.
 */
@Injectable()
export class OfferingService {}
