import { Injectable } from '@nestjs/common';
import { Repository, LessThan, MoreThan, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

@Injectable()
export class ReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
  ) {}

  async saveReservation(reservation: Reservation): Promise<Reservation> {
    return this.repo.save(reservation);
  }

  /**
   * ดึงเลข run ล่าสุดของวันนั้นจาก code รูป RSV-YYYYMMDD-NNNN
   * คืนค่า run number (ตัวเลขหลังขีดสุดท้าย) หรือ 0 ถ้ายังไม่มีของวันนี้
   */
  async getLatestRunNumberForDate(dateStr: string): Promise<number> {
    const datePart = dateStr.slice(0, 10).replace(/-/g, '');
    const prefix = `RSV-${datePart}-`;
    const latest = await this.repo.findOne({
      where: { code: Like(`${prefix}%`) },
      order: { code: 'DESC' },
      select: ['code'],
    });
    if (!latest?.code) return 0;
    const runPart = latest.code.slice(prefix.length);
    const run = parseInt(runPart, 10);
    return Number.isNaN(run) ? 0 : run;
  }

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
        'reservationLines.dog.breed',
        'dogOwner',
      ],
    });
  }

  async findByDogOwnerId(dogOwnerId: number): Promise<Reservation[]> {
    return this.repo.find({
      where: { dogOwner: { id: dogOwnerId } },
      relations: [
        'reservationLines',
        'reservationLines.offering',
        'reservationLines.dog',
        'reservationLines.dog.breed',
        'dogOwner',
      ],
      order: { startDateTime: 'DESC' },
    });
  }

  async findOneByCodeAndDogOwnerId(
    code: string,
    dogOwnerId: number,
  ): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { code, dogOwner: { id: dogOwnerId } },
      relations: [
        'reservationLines',
        'reservationLines.offering',
        'reservationLines.offering.offerSizePricing',
        'reservationLines.dog',
        'reservationLines.dog.breed',
        'dogOwner',
        'paymentSlip',
        'statusLogs',
      ],
    });
  }

  /** ดึงการจองตาม code เท่านั้น (สำหรับ staff ยืนยัน/ปฏิเสธสลิป) */
  async findOneByCode(code: string): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { code },
      relations: ['paymentSlip', 'statusLogs'],
    });
  }
}