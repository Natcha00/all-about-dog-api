import { DogOwner } from "src/dog-owner/entities/dog-owner.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Breed } from "./breed.entity";
import { Health } from "./health.entity";
import { VaccinationRecord } from "./vaccinationRecord.entity";

@Entity()
export class Dog {
    @PrimaryGeneratedColumn()
    id:number
    @Column()
    name:string
    @Column()
    gender:string
    @Column()
    color:string
    @Column()
    weight:number
    @Column()
    height:number
    @Column()
    birthdate:Date

    @ManyToOne(()=>DogOwner,(dogOwner)=>dogOwner.dogs)
    dogOwner:DogOwner

    @ManyToOne(()=>Breed,(breed)=>breed.dogs)
    breed:Breed

    @OneToOne(()=>Health)
    health:Health

    @OneToMany(()=>VaccinationRecord,(vaccinationRecord)=>vaccinationRecord.dogs)
    vaccinationRecords:VaccinationRecord[]
}
