import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { StaffGuard } from 'src/staff/guards/staff.guard';
import { ROLE } from 'src/user/enums/role.enum';

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
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetBoardingAvailableResponse> {
    const dogOwnerId = this.resolveDogOwnerId(user, query.dogOwnerId, 'boarding/available');
    return await this.getBoardingAvailableUsecase.execute(query, dogOwnerId);
  }

  @Get('/boarding/package-pricing')
  @UseGuards(AccessTokenGuard)
  async getBoardingPackagePricing(
    @Query() query: GetBoardingPackagePricingRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetBoardingPackagePricingResponse> {
    const dogOwnerId = this.resolveDogOwnerId(user, query.dogOwnerId, 'boarding/package-pricing');
    return await this.getBoardingPackagePricingUsecase.execute(query, dogOwnerId);
  }

  @Get('/swimming/package-pricing')
  @UseGuards(AccessTokenGuard)
  async getSwimmingPackagePricing(
    @Query() query: GetSwimmingPackagePricingRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetSwimmingPackagePricingResponse> {
    const dogOwnerId = this.resolveDogOwnerId(user, query.dogOwnerId, 'swimming/package-pricing');
    return await this.getSwimmingPackagePricingUsecase.execute(query, dogOwnerId);
  }

  private resolveDogOwnerId(
    user: IUser,
    dogOwnerIdFromQuery: number | undefined,
    endpoint: string,
  ): number {
    if (user.role === ROLE.DOG_OWNER) {
      return user.id;
    }
    if (user.role === ROLE.STAFF) {
      if (dogOwnerIdFromQuery == null) {
        throw new BadRequestException(
          `กรุณาระบุ dogOwnerId เมื่อเรียก ${endpoint} จากฝั่ง staff`,
        );
      }
      return dogOwnerIdFromQuery;
    }
    throw new BadRequestException(`ไม่สามารถเรียก ${endpoint} สำหรับ role นี้ได้`);
  }

  @Get('/available')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async getOfferingAvailable(
    @Query() query: GetOfferingAvailableRequest,
  ): Promise<GetOfferingAvailableResponse> {
    return this.getOfferingAvailableUsecase.execute(query);
  }
}
