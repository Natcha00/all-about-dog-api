import { DogOwner } from 'src/dog-owner/entities/dog-owner.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Breed } from './breed.entity';
import { CoatType } from '../enums/coat-type.enum';
import { Health } from './health.entity';
import { VaccinationRecord } from './vaccination-record.entity';

@Entity()
export class Dog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column()
  color: string;

  @Column({ type: 'enum', enum: CoatType })
  coatType: CoatType;

  @Column()
  weight: number;

  @Column()
  height: number;

  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  @Column({ type: 'text', nullable: true })
  dogPictureUrl: string | null;

  @ManyToOne(() => DogOwner, (dogOwner) => dogOwner.dogs)
  dogOwner: DogOwner;

  @ManyToOne(() => Breed, (breed) => breed.dogs)
  breed: Breed;

  @OneToOne(() => Health, (health) => health.dog, { cascade: true })
  health: Health;

  @OneToMany(
    () => VaccinationRecord,
    (vaccinationRecord) => vaccinationRecord.dog,
  )
  vaccinationRecords: Array<VaccinationRecord>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
