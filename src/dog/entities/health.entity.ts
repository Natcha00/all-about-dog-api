import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Health {
    @PrimaryGeneratedColumn()
    id : number
    @Column()
    detail : string
    @Column()
    sterilization : boolean
    @Column()
    microchip : boolean
    @Column()
    underlyingDisease : string
    @Column()
    allergy : string
    @Column()
    bloodGroup : string
    @Column()
    hasBreakfast: boolean;
    @Column()
    hasAfterBreakfast: boolean;
    @Column()
    hasLunch: boolean;
    @Column()
    hasAfterLunch: boolean;
    @Column()
    hasDinner: boolean;
}