import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

/**
 * Log การเปลี่ยนแปลงสถานะของ reservation ใช้สำหรับ timeline และ audit
 */
@Entity()
export class ReservationStatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.statusLogs, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;

  @Column({ type: 'varchar', length: 50 })
  status: ReservationStatusEnum;

  @CreateDateColumn()
  occurredAt: Date;

  /** User id หรือ identifier ที่ทำให้เกิดการเปลี่ยนสถานะ (nullable) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  performedBy: string | null;

  /** ผู้ทำ action: STAFF หรือ DOG_OWNER */
  @Column({ type: 'varchar', length: 20, nullable: true })
  actorRole: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string | null;
}
