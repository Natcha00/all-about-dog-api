import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DogOwner } from './dog-owner.entity';
import { OtpType } from '../enums/otp-type.enum';

@Entity('dog_owner_otp')
export class DogOwnerOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DogOwner, { onDelete: 'CASCADE' })
  dogOwner: DogOwner;

  @Column({ type: 'varchar', length: 20 })
  type: OtpType;

  @Column({ type: 'varchar', length: 10 })
  otp: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;
}
