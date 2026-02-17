import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Offering } from "./offering.entity";

@Entity()
export class OfferVipPricing {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    normalPrice : number

    @Column()
    specialPrice : number

    @OneToOne(()=>Offering)
    @JoinColumn()
    offering:Offering
}