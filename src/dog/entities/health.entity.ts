import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dog } from './dog.entity';
import { BloodGroup } from '../enums/blood-group.enum';

@Entity()
export class Health {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @Column()
  sterilization: boolean;

  @Column()
  microchip: boolean;

  @Column({ type: 'text', nullable: true })
  underlyingDisease: string | null;

  @Column({ type: 'text', nullable: true })
  allergy: string | null;

  @Column({ type: 'varchar', length: 30 })
  bloodGroup: BloodGroup | null;

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

  @OneToOne(() => Dog)
  @JoinColumn()
  dog: Dog;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
