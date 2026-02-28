export type Slot = {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  statusLabel: string;
  isFull: boolean;
  isEmpty: boolean;
};