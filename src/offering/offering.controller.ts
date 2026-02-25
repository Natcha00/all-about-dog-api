import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetAnnouncementUsecase } from './use-cases/get-annoucement.use-case';
import {
  GetOfferAvailableRequest,
  GetOfferAvailableResponse,
} from './dtos/get-offer-available.dto';
import { GetOfferAvailableUsecase } from './use-cases/get-available.use-case';
import {
  GetOfferPackagePricingRequest,
  GetOfferPackagePricingResponse,
} from './dtos/get-offer-package-pricing.dto';
import { GetOfferPackagePricingUsecase } from './use-cases/get-offer-package-pricing.use-case';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';

@Controller('offering')
export class OfferingController {
  constructor(
    private readonly getAnnouncementUsecase: GetAnnouncementUsecase,
    private readonly getOfferAvailableUsecase: GetOfferAvailableUsecase,
    private readonly getOfferPackagePricingUsecase: GetOfferPackagePricingUsecase,
  ) {}

  @Get('/announcement')
  async getAnnouncement() {
    return this.getAnnouncementUsecase.execute();
  }

  @Get('/available')
  @UseGuards(AccessTokenGuard)
  async getAvailable(
    @Query() query: GetOfferAvailableRequest,
    @DogOwnerDecorator() dogOwner: IUser,
  ): Promise<GetOfferAvailableResponse> {
    return await this.getOfferAvailableUsecase.execute(query, dogOwner.id);
  }

  @Get('/package-pricing')
  @UseGuards(AccessTokenGuard)
  async getPackagePricing(
    @Query() query: GetOfferPackagePricingRequest,
    @DogOwnerDecorator() dogOwner: IUser,
  ): Promise<GetOfferPackagePricingResponse> {
    return await this.getOfferPackagePricingUsecase.execute(query, dogOwner.id);
  }
}
