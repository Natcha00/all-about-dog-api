import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Dog } from "./dog.entity";

@Entity()
export class VaccinationRecord {
    @PrimaryGeneratedColumn()
    id:number
    @Column()
    vaccineName : string
    @Column()
    clinicName : string
    @Column()
    note : string

    @ManyToOne(()=>Dog,(dog)=>dog.vaccinationRecords)
    dogs:Dog


}
   