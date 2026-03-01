import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSlip } from './entities/payment-slip.entity';

@Injectable()
export class PaymentSlipRepository {
  constructor(
    @InjectRepository(PaymentSlip)
    private readonly repo: Repository<PaymentSlip>,
  ) {}

  async save(slip: PaymentSlip): Promise<PaymentSlip> {
    return this.repo.save(slip);
  }


  async findByReservationId(reservationId: string): Promise<PaymentSlip | null> {
    return this.repo.findOne({
      where: { reservation: { id: reservationId } },
    });
  }

  create(partial: Partial<PaymentSlip>): PaymentSlip {
    return this.repo.create(partial);
  }
}
