import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

    @OneToOne(()=>Breed,(breed)=>breed.offerBreedPricing)
    @JoinColumn()
    breed:Breed
}