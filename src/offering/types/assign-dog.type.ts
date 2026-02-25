import { Dog } from 'src/dog/entities/dog.entity';

export type AssignDogs = Map<number, OfferAssign>;

export type PricePerNight = {
  normalPrice: number;
  specialPrice: number;
};

export type OfferAssign = {
  id: number;
  name: string;
  set: Array<Set<Dog>>;
  /** ราคาต่อคืนของ offering นี้ (จาก offerSizePricing หรือ offerVipPricing) */
  pricePerNight: PricePerNight;
};