import { ReservationStatusEnum } from 'src/common/enums/reservation-status.enum';
import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import { ReservationItem } from 'src/reservation/entities/reservation-item.entity';

export class Reservation {
  id: string;
  code: string;
  status: ReservationStatusEnum;
  bill_amount: number;
  service_id: number;
  start_date_time: Date;
  end_date_time: Date;
  remark: string;
  dogOwner: DogOwner;
  reservation_items: Array<ReservationItem>;
}
