import { Controller, Get } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { GetAnnouncementUsecase } from './use-cases/get-annoucement.use-case';

@Controller('offering')
export class OfferingController {
  constructor(
    private readonly getAnnouncementUsecase:GetAnnouncementUsecase
  ) {}

  @Get("/announcement")
  async getAnnouncement(){
    return this.getAnnouncementUsecase.execute()
  }
}
