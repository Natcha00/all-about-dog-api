import { Dog } from "src/dog/entities/dog.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class DogOwner {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstName: string;
  @Column()
  lastname: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  phoneNumber: string;
  @Column({nullable: true })
  address: string;
  @Column({ nullable: true })
  profilePictureUrl: string;


  @OneToMany (()=>Dog,(dogs)=>dogs.dogOwner)
  dogs:Dog[]
}

