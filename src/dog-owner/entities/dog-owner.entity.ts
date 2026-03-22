import { Dog } from 'src/dog/entities/dog.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DogOwner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  profilePictureUrl: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Dog, (dogs) => dogs.dogOwner)
  dogs: Array<Dog>;

  @OneToMany(() => Reservation, (reservations) => reservations.dogOwner)
  reservations: Array<Reservation>;
}
