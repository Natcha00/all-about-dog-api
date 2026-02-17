import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CheckinStatus } from "../enums/checkin-status.enum";
import { Reservation } from "./reservation.entity";

@Entity()
export class CheckinHistory {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    status:CheckinStatus

    @ManyToOne(()=>Reservation,(reservation)=>reservation)
    reservation:Reservation

    @CreateDateColumn()
    createdAt:Date

    @UpdateDateColumn()
    updatedAt:Date

    @DeleteDateColumn()
    deletedAt:Date
}