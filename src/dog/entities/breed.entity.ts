import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Size } from '../enums/size.enum';
import { Dog } from './dog.entity';
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';

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

  @OneToOne(()=>OfferBreedPricing,(offerBreedPricing)=>offerBreedPricing.breed)
  offerBreedPricing: OfferBreedPricing
}
