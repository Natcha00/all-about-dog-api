import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Offering } from "./offering.entity";
import { Size } from "src/dog/enums/size.enum";

@Entity()
export class OfferSizePricing {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    normalPrice : number

    @Column()
    specialPrice : number

    @Column()
    size:Size

    @OneToOne(()=>Offering,(offering)=>offering.offerSizePricing)
    @JoinColumn()
    offering:Offering

}