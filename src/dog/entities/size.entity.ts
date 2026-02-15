import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Breed } from './breed.entity';

@Entity()
export class Size {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  size: string;

  @OneToMany(()=>Breed,(breed)=>breed.size)
    breeds:Breed[]
}

