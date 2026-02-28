import { Dog } from 'src/dog/entities/dog.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ReservationLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  groupNumber: number;

  @ManyToOne(() => Offering, (offering) => offering.reservationLines)
  @JoinColumn()
  offering: Offering;

  @ManyToOne(() => Dog)
  @JoinColumn()
  dog: Dog;

  @ManyToOne(() => Reservation, (reservation) => reservation.reservationLines)
  reservation: Reservation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
