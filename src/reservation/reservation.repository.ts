import { Injectable } from '@nestjs/common';
import { Repository, LessThan, MoreThan, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { OfferingType } from 'src/offering/enums/offering-type.enum';
import { ReservationStatusEnum } from './enums/reservation-status.enum';

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
        'paymentSlip',
      ],
    });
  }

  /**
   * Prevent duplicate swimming booking: find any existing non-cancelled
   * swimming reservations that overlap the given period for any dogId.
   */
  async findSwimmingConflictsByDogIds(params: {
    start: Date;
    end: Date;
    dogIds: number[];
  }): Promise<Reservation[]> {
    const { start, end, dogIds } = params;
    if (!dogIds?.length) return [];

    return this.repo
      .createQueryBuilder('r')
      .innerJoinAndSelect(
        'r.reservationLines',
        'rl',
        'rl.deletedAt IS NULL',
      )
      .innerJoinAndSelect('rl.dog', 'd', 'd.deletedAt IS NULL')
      .where('r.offeringType = :type', { type: OfferingType.SWIMMING })
      .andWhere('r.status != :cancelled', {
        cancelled: ReservationStatusEnum.CANCELLED,
      })
      .andWhere('r.startDateTime < :end AND r.endDateTime > :start', {
        start,
        end,
      })
      .andWhere('d.id IN (:...dogIds)', { dogIds })
      .orderBy('r.startDateTime', 'DESC')
      .getMany();
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
      order: { startDateTime: 'ASC' },
    });
  }

  /** ดึงการจองทั้งหมด (สำหรับ staff ไม่เจาะจง dogOwner) */
  async findAll(): Promise<Reservation[]> {
    return this.repo.find({
      relations: [
        'reservationLines',
        'reservationLines.offering',
        'reservationLines.dog',
        'reservationLines.dog.breed',
        'dogOwner',
      ],
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * ดึงประวัติการจองที่จบแล้ว (status = FINISHED) ของสุนัขแต่ละตัว
   */
  async findFinishedByDogId(dogId: number): Promise<Reservation[]> {
    return this.repo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.reservationLines', 'rl')
      .innerJoinAndSelect('rl.dog', 'd')
      .where('d.id = :dogId', { dogId })
      .andWhere('r.status = :status', {
        status: ReservationStatusEnum.FINISHED,
      })
      .orderBy('r.startDateTime', 'DESC')
      .getMany();
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

  /** code + รายการบรรทัด/สุนัข (สำหรับ staff อนุมัติ / เช็คอิน / ยืนยันสลิป + ตรวจความจุห้องหรือสระ) */
  async findOneByCodeWithStaffRelations(
    code: string,
  ): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { code },
      relations: [
        'reservationLines',
        'reservationLines.dog',
        'reservationLines.dog.breed',
        'reservationLines.offering',
        'paymentSlip',
        'statusLogs',
        'dogOwner',
      ],
    });
  }

  /** ดึงการจองตาม code พร้อม dogOwner และรายการสุนัข (สำหรับส่งอีเมลแจ้งสถานะ) */
  async findOneByCodeWithDogOwner(code: string): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { code },
      relations: [
        'dogOwner',
        'reservationLines',
        'reservationLines.dog',
        'reservationLines.dog.breed',
      ],
    });
  }

  /**
   * ค้นหาการจองจาก key แต่ละแบบ
   * - code
   * - dogName
   * - dogOwnerName (firstName / lastName)
   * - phone (phoneNumber)
   * ถ้าไม่ได้ส่ง key ใดเลยจะคืน [] เพื่อป้องกันการโหลดทั้งหมด
   */
  async searchAdvanced(params: {
    code?: string;
    dogName?: string;
    dogOwnerName?: string;
    phone?: string;
  }): Promise<Reservation[]> {
    const { code, dogName, dogOwnerName, phone } = params;
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.dogOwner', 'o');

    const hasAny =
      !!code || !!dogName || !!dogOwnerName || !!phone;
    if (!hasAny) {
      return [];
    }

    if (dogName) {
      qb.innerJoinAndSelect('r.reservationLines', 'rl')
        .innerJoinAndSelect('rl.dog', 'd');
    } else {
      qb.leftJoinAndSelect('r.reservationLines', 'rl')
        .leftJoinAndSelect('rl.dog', 'd');
    }

    if (code) {
      qb.andWhere('r.code LIKE :code', { code: `%${code}%` });
    }
    if (dogName) {
      qb.andWhere('d.name LIKE :dogName', { dogName: `%${dogName}%` });
    }
    if (dogOwnerName) {
      qb.andWhere(
        '(o.firstName LIKE :owner OR o.lastName LIKE :owner)',
        { owner: `%${dogOwnerName}%` },
      );
    }
    if (phone) {
      qb.andWhere('o.phoneNumber LIKE :phone', { phone: `%${phone}%` });
    }

    qb.andWhere('rl.deletedAt IS NULL').andWhere('d.deletedAt IS NULL');
    qb.orderBy('r.startDateTime', 'DESC');
    return qb.getMany();
  }
}