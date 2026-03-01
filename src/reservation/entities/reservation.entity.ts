import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';
import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import { ReservationLine } from 'src/reservation/entities/reservation-line.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CheckinHistory } from './checkin-history.entity';
import { PaymentSlip } from './payment-slip.entity';
import { ReservationStatusLog } from './reservation-status-log.entity';
import { OfferingType } from 'src/offering/enums/offering-type.enum';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  code: string;

  @Column()
  status: ReservationStatusEnum;

  @Column()
  startDateTime: Date;

  @Column()
  endDateTime: Date;

  @Column()
  remark: string;

  @Column()
  offeringType: OfferingType;

  @OneToMany(
    () => ReservationLine,
    (reservationLines) => reservationLines.reservation,
    { cascade: true },
  )
  reservationLines: Array<ReservationLine>;

  @OneToMany(
    () => CheckinHistory,
    (checkinHistory) => checkinHistory.reservation,
  )
  checkinHistories: Array<CheckinHistory>;

  @OneToMany(
    () => ReservationStatusLog,
    (log) => log.reservation,
    { cascade: true },
  )
  statusLogs: Array<ReservationStatusLog>;

  @OneToOne(() => PaymentSlip, (slip) => slip.reservation, { cascade: true })
  paymentSlip: PaymentSlip;

  @ManyToOne(() => DogOwner, (dogOwner) => dogOwner.reservations)
  dogOwner: DogOwner;
}
