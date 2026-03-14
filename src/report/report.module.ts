import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { GetOfferingSummaryUsecase } from './use-cases/get-offering-summary.usecase';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [ReservationModule],
  controllers: [ReportController],
  providers: [ReportService, GetOfferingSummaryUsecase],
})
export class ReportModule {}
