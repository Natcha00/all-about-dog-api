import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CoatType } from "src/dog/enums/coat-type.enum";
import { Offering } from "./offering.entity";

@Entity()   
export class OfferCoatPricing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    coat: CoatType

    @Column()
    max_weight: number

    @Column()
    price: number;

    @ManyToOne(()=>Offering,(offering)=>offering.offerCoatPricing)
    offering:Offering
}