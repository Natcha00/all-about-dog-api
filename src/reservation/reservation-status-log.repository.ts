import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationStatusLog } from './entities/reservation-status-log.entity';
import { ReservationStatusEnum } from './enums/reservation-status.enum';

@Injectable()
export class ReservationStatusLogRepository {
  constructor(
    @InjectRepository(ReservationStatusLog)
    private readonly repo: Repository<ReservationStatusLog>,
  ) {}

  async save(log: ReservationStatusLog): Promise<ReservationStatusLog> {
    return this.repo.save(log);
  }

  async createAndSave(
    reservationId: string,
    status: ReservationStatusEnum,
    performedBy: string | null = null,
    label: string | null = null,
    actorRole: string | null = null,
  ): Promise<ReservationStatusLog> {
    const log = this.repo.create({
      status,
      performedBy,
      label,
      actorRole,
    });
    log.reservation = { id: reservationId } as ReservationStatusLog['reservation'];
    return this.repo.save(log);
  }
}
