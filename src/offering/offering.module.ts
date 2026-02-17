import { Module } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { OfferingController } from './offering.controller';

@Module({
  controllers: [OfferingController],
  providers: [OfferingService],
})
export class OfferingModule {}
