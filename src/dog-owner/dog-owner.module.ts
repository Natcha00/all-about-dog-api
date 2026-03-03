import { Module } from '@nestjs/common';
import { DogOwnerService } from './dog-owner.service';
import { DogOwnerController } from './dog-owner.controller';
import { DogOwnerRepository } from './dog-owner.repository';
import { DogOwner } from './entities/dog-owner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from 'src/dog/entities/dog.entity';
import { UserModule } from 'src/user/user.module';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DogOwner]),
    UserModule,
    StaffModule,
  ],
  controllers: [DogOwnerController],
  providers: [DogOwnerService, DogOwnerRepository],
  exports:[DogOwnerService]
})
export class DogOwnerModule {}
