import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Offering } from "./offering.entity";
import { Breed } from "src/dog/entities/breed.entity";

@Entity()
export class OfferBreedPricing {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    normalPrice : number

    @Column()
    specialPrice : number

    @ManyToOne(()=>Offering,(offering)=>offering.offerBreedPricing)
    offering:Offering

    @ManyToOne(()=>Breed)
    breed:Breed
}