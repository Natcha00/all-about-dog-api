import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';
import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import { ReservationLine } from 'src/reservation/entities/reservation-line.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CheckinHistory } from './checkin-history.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import { PaymentSlip } from './payment-slip.entity';
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
  offeringType:OfferingType

  @OneToMany(()=>ReservationLine,(reservationLines)=>reservationLines.reservation)
  reservationLines: Array<ReservationLine>;

  @OneToMany(()=>CheckinHistory,(checkinHistory)=>checkinHistory.reservation)
  checkinHistories:Array<CheckinHistory>

  @OneToOne(()=>PaymentSlip)
  paymentSlip:PaymentSlip

  @ManyToOne(() => DogOwner, (dogOwner) => dogOwner.reservations)
  dogOwner: DogOwner;
}
