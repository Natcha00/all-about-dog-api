import { Reservation } from "src/reservation/entities/reservation.entity";

export class ReservationItem {
  id: number;
  reservation: Reservation;
  dog: number;
  service: number;
  price: number;
  quantity: number;
  total_price: number;
}
