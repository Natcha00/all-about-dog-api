import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Dog } from './dog.entity';

@Entity()
export class VaccinationRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vaccineName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clinicName: string | null;

  @Column()
  dose: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  evidenceImageUrl: string | null;

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
 
