import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DogOwnerOtp } from './entities/dog-owner-otp.entity';
import { OtpType } from './enums/otp-type.enum';

@Injectable()
export class DogOwnerOtpRepository {
  constructor(
    @InjectRepository(DogOwnerOtp)
    private readonly repo: Repository<DogOwnerOtp>,
  ) {}

  create(data: Partial<DogOwnerOtp>): DogOwnerOtp {
    return this.repo.create(data);
  }

  async save(otp: DogOwnerOtp): Promise<DogOwnerOtp> {
    return this.repo.save(otp);
  }

  async findOneByDogOwnerIdAndType(
    dogOwnerId: number,
    type: OtpType,
  ): Promise<DogOwnerOtp | null> {
    return this.repo.findOne({
      where: {
        dogOwner: { id: dogOwnerId },
        type,
      },
      relations: ['dogOwner'],
    });
  }

  async remove(otp: DogOwnerOtp): Promise<void> {
    await this.repo.remove(otp);
  }
}
