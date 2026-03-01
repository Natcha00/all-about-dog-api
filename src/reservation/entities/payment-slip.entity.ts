import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class PaymentSlip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slipUrl: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approveBy: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updateBy: string | null;

  @Column({ type: 'text', nullable: true })
  rejectedReason: string | null;


  @OneToOne(() => Reservation, (reservation) => reservation.paymentSlip)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
