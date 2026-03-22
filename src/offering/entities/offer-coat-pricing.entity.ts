import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CoatType } from "src/dog/enums/coat-type.enum";
import { Offering } from "./offering.entity";

@Entity()
export class OfferCoatPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coat: CoatType;

  /**
   * ช่วงน้ำหนัก (kg) แบบครึ่งช่วง [minWeightKg, maxWeightKg):
   * น้ำหนักต้องเป็น weight >= min และ (maxWeightKg เป็น null หรือ weight < maxWeightKg).
   * ตัวอย่าง: <5 → min=0,max=5 | 5-10 → min=5,max=10 | >50 → min=50,max=null
   */
  @Column({ type: 'double' })
  minWeightKg: number;

  @Column({ type: 'double', nullable: true })
  maxWeightKg: number | null;

  @Column()
  price: number;

  @ManyToOne(() => Offering, (offering) => offering.offerCoatPricing)
  offering: Offering;
}
