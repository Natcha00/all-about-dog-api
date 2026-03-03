import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { ConfirmReservationRequest } from './dtos/confirm-reservation.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { ConfirmReservationUsecase } from './use-cases/confirm-reservation.use-case';
import { GetReservationsUsecase } from './use-cases/get-reservations.use-case';
import { GetReservationsRequest, GetReservationsResponse } from './dtos/get-reservations.dto';
import { GetReservationDetailUsecase } from './use-cases/get-reservation-detail.use-case';
import { GetReservationDetailResponse } from './dtos/get-reservation-detail.dto';
import { UploadPaymentSlipUsecase } from './use-cases/upload-payment-slip.use-case';
import { VerifyPaymentSlipUsecase } from './use-cases/verify-payment-slip.use-case';
import { RejectPaymentSlipUsecase } from './use-cases/reject-payment-slip.use-case';
import { ApproveReservationUsecase } from './use-cases/approve-reservation.use-case';
import { ApproveReservationRequest } from './dtos/approve-reservation.dto';
import { VerifySlipRequest, RejectSlipRequest } from './dtos/verify-reject-slip.dto';
import { CheckInReservationRequest, CheckOutReservationRequest } from './dtos/checkin-checkout.dto';
import { CheckInReservationUsecase } from './use-cases/checkin-reservation.use-case';
import { CheckOutReservationUsecase } from './use-cases/checkout-reservation.use-case';
import { SearchReservationRequest } from './dtos/search-reservation.dto';
import { SearchReservationsUsecase } from './use-cases/search-reservations.use-case';

@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly confirmReservationUsecase: ConfirmReservationUsecase,
    private readonly getReservationsUsecase: GetReservationsUsecase,
    private readonly getReservationDetailUsecase: GetReservationDetailUsecase,
    private readonly approveReservationUsecase: ApproveReservationUsecase,
    private readonly uploadPaymentSlipUsecase: UploadPaymentSlipUsecase,
    private readonly verifyPaymentSlipUsecase: VerifyPaymentSlipUsecase,
    private readonly rejectPaymentSlipUsecase: RejectPaymentSlipUsecase,
    private readonly checkInReservationUsecase: CheckInReservationUsecase,
    private readonly checkOutReservationUsecase: CheckOutReservationUsecase,
    private readonly searchReservationsUsecase: SearchReservationsUsecase,
  ) {}

  @Post()
  createReservation(@Body() reservationBody: Reservation) {
    // return this.reservationService.createReservation(reservationBody)
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getReservations(
    @Query() query: GetReservationsRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetReservationsResponse> {
    return this.getReservationsUsecase.execute(user.id, query.tab);
  }

  @Get('search')
  @UseGuards(AccessTokenGuard)
  async searchReservations(
    @Query() query: SearchReservationRequest,
  ): Promise<Reservation[]> {
    return this.searchReservationsUsecase.execute(query);
  }

  @Get('detail')
  @UseGuards(AccessTokenGuard)
  async getReservationDetail(
    @Query('code') code: string,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetReservationDetailResponse> {
    const result = await this.getReservationDetailUsecase.execute(code, user.id);
    return { statusCode: 200, result };
  }

  @Post('confirm')
  @UseGuards(AccessTokenGuard)
  async confirm(
    @Body() body: ConfirmReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<Reservation> {
    return this.confirmReservationUsecase.execute(body, user.id);
  }

  @Post('approve')
  @UseGuards(AccessTokenGuard)
  async approveReservation(
    @Body() body: ApproveReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ success: boolean }> {
    return this.approveReservationUsecase.execute(body.code, user.id);
  }

  @Post('slip/upload')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadSlip(
    @Body('code') code: string,
    @UploadedFile() file: Express.Multer.File,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ slipUrl: string }> {
    if (!code || typeof code !== 'string') {
      throw new BadRequestException('กรุณาระบุ code การจอง');
    }
    if (!file?.buffer) {
      throw new BadRequestException('กรุณาแนบไฟล์รูปภาพ');
    }
    return this.uploadPaymentSlipUsecase.execute(code, user.id, file);
  }

  @Post('slip/verify')
  @UseGuards(AccessTokenGuard)
  async verifySlip(
    @Body() body: VerifySlipRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ success: boolean }> {
    return this.verifyPaymentSlipUsecase.execute(body.code, user.id);
  }

  @Post('checkin')
  @UseGuards(AccessTokenGuard)
  async checkIn(
    @Body() body: CheckInReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ success: boolean }> {
    return this.checkInReservationUsecase.execute(body.code, user.id);
  }

  @Post('checkout')
  @UseGuards(AccessTokenGuard)
  async checkOut(
    @Body() body: CheckOutReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ success: boolean }> {
    return this.checkOutReservationUsecase.execute(body.code, user.id);
  }

  @Post('slip/reject')
  @UseGuards(AccessTokenGuard)
  async rejectSlip(
    @Body() body: RejectSlipRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ success: boolean }> {
    return this.rejectPaymentSlipUsecase.execute(body.code, user.id, body.reason);
  }
}
