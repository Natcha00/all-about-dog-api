import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Size } from '../enums/size.enum';
import { Dog } from './dog.entity';

@Entity()
export class Breed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameTh: string;

  @Column()
  nameEng: string;

  @Column()
  size: Size;

  @OneToMany(() => Dog, (dogs) => dogs.breed)
  dogs: Dog[];
}
