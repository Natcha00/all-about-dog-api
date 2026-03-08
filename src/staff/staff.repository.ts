import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffRepository {
  constructor(
    @InjectRepository(Staff)
    private readonly repo: Repository<Staff>,
  ) {}

  create(partial: Partial<Staff>): Staff {
    return this.repo.create(partial);
  }

  async save(staff: Staff): Promise<Staff> {
    return this.repo.save(staff);
  }

  async findOneByUsername(username: string): Promise<Staff | null> {
    return this.repo.findOne({ where: { username } });
  }

  async findOneByEmail(email: string): Promise<Staff | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Staff | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Staff[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
