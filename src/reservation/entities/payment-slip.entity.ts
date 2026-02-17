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

  @Column()
  isApproved:boolean

  @Column()
  approveBy: string;

  @Column()
  updateBy: string;

  @OneToOne(() => Reservation)
  @JoinColumn()
  reservation: Reservation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
