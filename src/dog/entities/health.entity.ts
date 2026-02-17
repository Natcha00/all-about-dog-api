import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Dog } from './dog.entity';

@Entity()
export class Health {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @Column()
  sterilization: boolean;

  @Column()
  microchip: boolean;

  @Column()
  underlyingDisease: string;

  @Column()
  allergy: string;

  @Column()
  bloodGroup: string;

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
