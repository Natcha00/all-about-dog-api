import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OfferingType } from "../enums/offering-type.enum";
import { OfferSizePricing } from "./offer-size-pricing.entity";
import { OfferBreedPricing } from "./offer-breed-pricing.entity";
import { OfferVipPricing } from "./offer-vip-pricing.entity";
import { ReservationLine } from "src/reservation/entities/reservation-line.entity";

@Entity()
export class Offering {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column({nullable:true})
    description:string

    @Column()
    offeringType:OfferingType

    @Column()
    maxCapacity:number
    
    @Column()
    isVip:boolean

    @OneToOne(()=>ReservationLine,(reservationLine)=>reservationLine.offering)
    reservationLine: ReservationLine

    @OneToMany(()=>OfferSizePricing,(offerSizePricing)=>offerSizePricing.offering)
    offerSizePricing : Array<OfferSizePricing>

    @OneToMany(()=>OfferBreedPricing,(offerBreedPricing)=>offerBreedPricing.offering)
    offerBreedPricing : Array<OfferBreedPricing>

    @OneToOne(()=>OfferVipPricing,(offerVipPricing)=>offerVipPricing.offering)
    offerVipPricing: OfferVipPricing
}