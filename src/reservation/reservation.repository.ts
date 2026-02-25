import { Injectable } from '@nestjs/common';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

@Injectable()
export class ReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
  ) {}

  /**
   * ดึงรายการจองที่ทับกับช่วงเวลา start–end และกรองตาม offeringType (ถ้าระบุ)
   * Overlap: (reservation.startDateTime < end) && (reservation.endDateTime > start)
   */
  async findByPeriod(
    start: Date,
    end: Date,
    offeringType?: OfferingType,
  ): Promise<Reservation[]> {
    const where: Record<string, unknown> = {
      startDateTime: LessThan(end),
      endDateTime: MoreThan(start),
    };
    if (offeringType != null) {
      where.offeringType = offeringType;
    }
    return this.repo.find({
      where,
      relations: [
        'reservationLines',
        'reservationLines.offering',
        'reservationLines.dog',
        'dogOwner',
      ],
    });
  }
}