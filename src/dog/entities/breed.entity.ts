import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Size } from "./size.entity";
import { Dog } from "./dog.entity";

@Entity()
export class Breed{
    @PrimaryGeneratedColumn()
    id:number
    @Column()
    nameTh:string
    @Column()
    nameEng:string

    @ManyToOne(()=>Size,(size)=>size.breeds)
    size:Size

    @OneToMany(()=>Dog,(dogs)=>dogs.breed)
    dogs:Dog[]

}