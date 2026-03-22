import { Dog } from 'src/dog/entities/dog.entity';
import { CoatType } from 'src/dog/enums/coat-type.enum';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';
import { OfferCoatPricing } from './entities/offer-coat-pricing.entity';

/** จัดกลุ่มแถวราคาตามขน เรียงตาม minWeightKg */
export function buildSwimmingCoatBandsByCoat(
  offerCoatPricings: OfferCoatPricing[],
): Map<CoatType, OfferCoatPricing[]> {
  const byCoat = new Map<CoatType, OfferCoatPricing[]>();
  for (const p of offerCoatPricings) {
    const list = byCoat.get(p.coat) ?? [];
    list.push(p);
    byCoat.set(p.coat, list);
  }
  for (const list of byCoat.values()) {
    list.sort((a, b) => a.minWeightKg - b.minWeightKg);
  }
  return byCoat;
}

/**
 * ช่วง [minWeightKg, maxWeightKg): weight >= min และ (max เป็น null หรือ weight < max)
 * สอดคล้องคอลัมน์ <5 | 5-10 | … | >50 (น้ำหนัก 10 กก. อยู่ช่อง 5–10 ถัดจาก <5)
 */
export function swimmingPriceFromCoatBands(
  bandsByCoat: Map<CoatType, OfferCoatPricing[]>,
  coat: CoatType,
  weight: number,
): number {
  const bands = bandsByCoat.get(coat);
  const row = bands?.find(
    (p) =>
      weight >= p.minWeightKg &&
      (p.maxWeightKg == null || weight < p.maxWeightKg),
  );
  return row?.price ?? 0;
}

/** ป้ายช่วงน้ำหนักสำหรับแสดง (ตารางโปรโมชัน) */
export function formatSwimmingCoatBandLabel(
  minWeightKg: number,
  maxWeightKg: number | null,
): string {
  if (minWeightKg <= 0 && maxWeightKg != null) {
    return `น้อยกว่า ${maxWeightKg} kg`;
  }
  if (maxWeightKg == null) {
    return `มากกว่า ${minWeightKg} kg`;
  }
  return `${minWeightKg}-${maxWeightKg} kg`;
}

/**
 * When `offer_breed_pricing` has both min/max weight (kg, inclusive), use `normalPrice`
 * only if the dog's weight falls in that band; otherwise fall back to coat tiers.
 */
export function swimmingBreedBandPrice(
  breedId: number | undefined,
  weight: number,
  bandPricings: OfferBreedPricing[],
): number | undefined {
  if (breedId == null) return undefined;
  const row = bandPricings.find(
    (p) =>
      p.breed?.id === breedId &&
      p.minWeightKg != null &&
      p.maxWeightKg != null &&
      weight >= p.minWeightKg &&
      weight <= p.maxWeightKg,
  );
  return row != null ? row.normalPrice : undefined;
}

export function swimmingPriceForDog(
  dog: Dog,
  bandsByCoat: Map<CoatType, OfferCoatPricing[]>,
  bandPricings: OfferBreedPricing[],
): number {
  const weight = dog.weight ?? 0;
  const band = swimmingBreedBandPrice(dog.breed?.id, weight, bandPricings);
  if (band !== undefined) return band;
  return swimmingPriceFromCoatBands(bandsByCoat, dog.coatType, weight);
}
