import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DogOwnerModule } from './dog-owner/dog-owner.module';
import { ReservationModule } from './reservation/reservation.module';
import { DogModule } from './dog/dog.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from './dog/entities/dog.entity';
import { Breed } from './dog/entities/breed.entity';
import { Size } from './dog/entities/size.entity';
import { DogOwner } from './dog-owner/entities/dog-owner.entity';
import { Health } from './dog/entities/health.entity';
import { VaccinationRecord } from './dog/entities/vaccinationRecord.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
     TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite', // หรือ ':memory:' ถ้าต้องการ memory DB
      entities: [Dog, Breed, Size, DogOwner, Health, VaccinationRecord],
      synchronize: true, // สร้างตารางอัตโนมัติ (ใช้เฉพาะตอน dev)
      logging:true
    }),
    DogOwnerModule, ReservationModule, DogModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
