import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Dog } from './dog.entity';

@Entity()
export class VaccinationRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vaccineName: string;

  @Column()
  clinicName: string;

  @Column()
  dose: number;

  @Column()
  evidenceImageUrl: string;

  @Column()
  vaccineDate: Date;


  @ManyToOne(() => Dog, (dog) => dog.vaccinationRecords)
  dog: Dog;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
 
