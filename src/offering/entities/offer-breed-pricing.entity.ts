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

    /** Inclusive kg; when set with `maxWeightKg`, `normalPrice` applies only within this band (swimming). */
    @Column({ type: 'double', nullable: true })
    minWeightKg: number | null;

    /** Inclusive kg; see `minWeightKg`. */
    @Column({ type: 'double', nullable: true })
    maxWeightKg: number | null;

    @ManyToOne(()=>Offering,(offering)=>offering.offerBreedPricing)
    offering:Offering

    @OneToOne(()=>Breed,(breed)=>breed.offerBreedPricing)
    @JoinColumn()
    breed:Breed
}