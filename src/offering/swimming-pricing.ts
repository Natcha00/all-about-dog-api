/**
 * สูตรคำนวณราคาว่ายน้ำต่อตัว (pure functions — ไม่ยิง DB)
 * ลำดับความสำคัญ: แบนด์ตามพันธุ์+น้ำหนัก (offer_breed_pricing) ก่อน
 * ถ้าไม่เข้าเงื่อนไข → ใช้ตารางตามประเภทขน + ช่วงน้ำหนัก (offer_coat_pricing)
 */
import { Dog } from 'src/dog/entities/dog.entity';
import { CoatType } from 'src/dog/enums/coat-type.enum';
import { OfferBreedPricing } from './entities/offer-breed-pricing.entity';
import { OfferCoatPricing } from './entities/offer-coat-pricing.entity';

/** จัดแถว offer_coat_pricing เป็น Map ต่อ coat แล้วเรียงช่วงน้ำหนักตาม minWeightKg */
export function buildSwimmingCoatBandsByCoat(
  offerCoatPricings: OfferCoatPricing[],
): Map<CoatType, OfferCoatPricing[]> {
  const byCoat = new Map<CoatType, OfferCoatPricing[]>();
  for (const p of offerCoatPricings) {
    const list = byCoat.get(p.coat) ?? [];
    list.push(p);
    byCoat.set(p.coat, list);
  }
  // ให้ find ช่วงถัดไปได้ถูกต้องเมื่อมีหลายแถวต่อ coat เดียวกัน
  for (const list of byCoat.values()) {
    list.sort((a, b) => a.minWeightKg - b.minWeightKg);
  }
  return byCoat;
}

/**
 * ราคาจากตารางขน: ช่วงน้ำหนักแบบ [min, max) — ขอบขวาไม่รวม
 * (max เป็น null = ช่วงเปิดด้านบน เช่น “มากกว่า X kg”)
 */
export function swimmingPriceFromCoatBands(
  bandsByCoat: Map<CoatType, OfferCoatPricing[]>,
  coat: CoatType,
  weight: number,
): number {
  const bands = bandsByCoat.get(coat);
  // เลือกแถวแรกที่ weight ตกในช่วงของแถวนั้น
  const row = bands?.find(
    (p) =>
      weight >= p.minWeightKg &&
      (p.maxWeightKg == null || weight < p.maxWeightKg),
  );
  return row?.price ?? 0;
}

/** แปลง min/max เป็นข้อความบน UI (ไม่ใช่ logic คิดราคา) */
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
 * ราคาพิเศษตามพันธุ์: ถ้า offer_breed_pricing มี min/max ครบและน้ำหนักอยู่ในช่วง [min,max] ปิด
 * คืน normalPrice; ไม่เจอหรือไม่มี breedId → undefined (ให้ไปใช้ตารางขน)
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

/** ราคาว่ายน้ำต่อตัว: พันธุ์+แบนด์ก่อน แล้วจึงขน+ช่วงน้ำหนัก */
export function swimmingPriceForDog(
  dog: Dog,
  bandsByCoat: Map<CoatType, OfferCoatPricing[]>,
  bandPricings: OfferBreedPricing[],
): number {
  const weight = dog.weight ?? 0;
  // 1) ลองราคาตาม breed + ช่วงน้ำหนักใน offer_breed_pricing
  const band = swimmingBreedBandPrice(dog.breed?.id, weight, bandPricings);
  if (band !== undefined) return band;
  // 2) fallback: ราคาตาม coatType + ช่วงน้ำหนักใน offer_coat_pricing
  return swimmingPriceFromCoatBands(bandsByCoat, dog.coatType, weight);
}
