import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OfferingType } from "../enums/offering-type.enum";
import { OfferSizePricing } from "./offer-size-pricing.entity";
import { OfferBreedPricing } from "./offer-breed-pricing.entity";
import { OfferVipPricing } from "./offer-vip-pricing.entity";
import { ReservationLine } from "src/reservation/entities/reservation-line.entity";
import { OfferCoatPricing } from "./offer-coat-pricing.entity";

@Entity()
export class Offering {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column({ type: 'text', nullable: true })
    description: string | null

    @Column()
    offeringType:OfferingType

    @Column()
    maxCapacity:number
    
    @Column()
    isVip:boolean

    @OneToMany(() => ReservationLine, (reservationLine) => reservationLine.offering)
    reservationLines: ReservationLine[]

    @OneToOne(()=>OfferSizePricing,(offerSizePricing)=>offerSizePricing.offering)
    offerSizePricing : OfferSizePricing

    @OneToMany(()=>OfferBreedPricing,(offerBreedPricing)=>offerBreedPricing.offering)
    offerBreedPricing : Array<OfferBreedPricing>

    @OneToOne(()=>OfferVipPricing,(offerVipPricing)=>offerVipPricing.offering)
    offerVipPricing: OfferVipPricing

    @OneToOne(()=>OfferCoatPricing,(offerCoatPricing)=>offerCoatPricing.offering)
    offerCoatPricing: OfferCoatPricing
}