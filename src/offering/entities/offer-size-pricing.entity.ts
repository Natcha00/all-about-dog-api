import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

    @ManyToOne(()=>Offering,(offering)=>offering.offerSizePricing)
    offering:Offering

}