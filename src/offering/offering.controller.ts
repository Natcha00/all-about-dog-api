import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetAnnouncementUsecase } from './use-cases/get-annoucement.use-case';
import {
  GetBoardingAvailableRequest,
  GetBoardingAvailableResponse,
} from './dtos/get-boarding-available.dto';
import { GetBoardingAvailableUsecase } from './use-cases/get-boarding-available.use-case';
import {
  GetBoardingPackagePricingRequest,
  GetBoardingPackagePricingResponse,
} from './dtos/get-boarding-package-pricing.dto';
import { GetBoardingPackagePricingUsecase } from './use-cases/get-boarding-package-pricing.use-case';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { GetSwimmingPackagePricingRequest, GetSwimmingPackagePricingResponse } from './dtos/get-swimming-package-pricing.dto';
import { GetSwimmingPackagePricingUsecase } from './use-cases/get-swimming-package-pricing.use-case';
import { GetOfferingAvailableRequest, GetOfferingAvailableResponse } from './dtos/get-offering-available.dto';
import { GetOfferingAvailableUsecase } from './use-cases/get-offering-available.use-case';

@Controller('offering')
export class OfferingController {
  constructor(
    private readonly getAnnouncementUsecase: GetAnnouncementUsecase,
    private readonly getBoardingAvailableUsecase: GetBoardingAvailableUsecase,
    private readonly getBoardingPackagePricingUsecase: GetBoardingPackagePricingUsecase,
    private readonly getSwimmingPackagePricingUsecase: GetSwimmingPackagePricingUsecase,
    private readonly getOfferingAvailableUsecase: GetOfferingAvailableUsecase,
  ) {}

  @Get('/announcement')
  async getAnnouncement() {
    return this.getAnnouncementUsecase.execute();
  }

  @Get('/boarding/available')
  @UseGuards(AccessTokenGuard)
  async getBoardingAvailable(
    @Query() query: GetBoardingAvailableRequest,
    @DogOwnerDecorator() dogOwner: IUser,
  ): Promise<GetBoardingAvailableResponse> {
    return await this.getBoardingAvailableUsecase.execute(query, dogOwner.id);
  }

  @Get('/boarding/package-pricing')
  @UseGuards(AccessTokenGuard)
  async getBoardingPackagePricing(
    @Query() query: GetBoardingPackagePricingRequest,
    @DogOwnerDecorator() dogOwner: IUser,
  ): Promise<GetBoardingPackagePricingResponse> {
    return await this.getBoardingPackagePricingUsecase.execute(query, dogOwner.id);
  }

  @Get('/swimming/package-pricing')
  @UseGuards(AccessTokenGuard)
  async getSwimmingPackagePricing(
    @Query() query: GetSwimmingPackagePricingRequest,
    @DogOwnerDecorator() dogOwner: IUser,
  ): Promise<GetSwimmingPackagePricingResponse> {
    return await this.getSwimmingPackagePricingUsecase.execute(query, dogOwner.id);
  }

  @Get('/available')
  @UseGuards(AccessTokenGuard)
  async getOfferingAvailable(
    @Query() query: GetOfferingAvailableRequest,
  ): Promise<GetOfferingAvailableResponse> {
    return this.getOfferingAvailableUsecase.execute(query);
  }
}
