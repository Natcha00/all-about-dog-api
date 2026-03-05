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
import { CreateReservationRequest } from './dtos/confirm-reservation.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { StaffGuard } from 'src/staff/guards/staff.guard';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { CreateReservationUsecase } from './use-cases/create-reservation.use-case';
import { GetReservationsUsecase } from './use-cases/get-reservations.use-case';
import { GetReservationsRequest, GetReservationsResponse } from './dtos/get-reservations.dto';
import { GetReservationDetailUsecase } from './use-cases/get-reservation-detail.use-case';
import {
  GetReservationDetailRequest,
  GetReservationDetailResponse,
} from './dtos/get-reservation-detail.dto';
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
import { CancelReservationRequest } from './dtos/cancel-reservation.dto';
import { CancelReservationUsecase } from './use-cases/cancel-reservation.use-case';
import { ROLE } from 'src/user/enums/role.enum';
import { StaffDecorator } from 'src/staff/decorators/staff.decorator';

@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly createReservationUsecase: CreateReservationUsecase,
    private readonly getReservationsUsecase: GetReservationsUsecase,
    private readonly getReservationDetailUsecase: GetReservationDetailUsecase,
    private readonly approveReservationUsecase: ApproveReservationUsecase,
    private readonly uploadPaymentSlipUsecase: UploadPaymentSlipUsecase,
    private readonly verifyPaymentSlipUsecase: VerifyPaymentSlipUsecase,
    private readonly rejectPaymentSlipUsecase: RejectPaymentSlipUsecase,
    private readonly checkInReservationUsecase: CheckInReservationUsecase,
    private readonly checkOutReservationUsecase: CheckOutReservationUsecase,
    private readonly searchReservationsUsecase: SearchReservationsUsecase,
    private readonly cancelReservationUsecase: CancelReservationUsecase,
  ) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async getReservations(
    @Query() query: GetReservationsRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetReservationsResponse> {
    let dogOwnerId: number | undefined;

    if (user.role === ROLE.DOG_OWNER) {
      dogOwnerId = user.id;
    } else if (user.role === ROLE.STAFF) {
      dogOwnerId = query.dogOwnerId;
    } else {
      throw new BadRequestException('ไม่สามารถดูรายการจองสำหรับ role นี้ได้');
    }

    return this.getReservationsUsecase.execute(dogOwnerId, query.tab);
  }

  @Get('search')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async searchReservations(
    @Query() query: SearchReservationRequest,
  ): Promise<Reservation[]> {
    return this.searchReservationsUsecase.execute(query);
  }

  @Get('detail')
  @UseGuards(AccessTokenGuard)
  async getReservationDetail(
    @Query() query: GetReservationDetailRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetReservationDetailResponse> {
    let dogOwnerId: number;

    if (user.role === ROLE.DOG_OWNER) {
      dogOwnerId = user.id;
    } else if (user.role === ROLE.STAFF) {
      if (query.dogOwnerId == null) {
        throw new BadRequestException(
          'กรุณาระบุ dogOwnerId เมื่อดูรายละเอียดการจองจากฝั่ง staff',
        );
      }
      dogOwnerId = query.dogOwnerId;
    } else {
      throw new BadRequestException(
        'ไม่สามารถดูรายละเอียดการจองสำหรับ role นี้ได้',
      );
    }

    const result = await this.getReservationDetailUsecase.execute(
      query.code,
      dogOwnerId,
    );
    return { statusCode: 200, result };
  }

  @Post('create')
  @UseGuards(AccessTokenGuard)
  async create(
    @Body() body: CreateReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<Reservation> {
    let dogOwnerId: number;

    if (user.role === ROLE.DOG_OWNER) {
      dogOwnerId = user.id;
    } else if (user.role === ROLE.STAFF) {
      if (body.dogOwnerId == null) {
        throw new BadRequestException(
          'กรุณาระบุ dogOwnerId เมื่อยืนยันจากฝั่ง staff',
        );
      }
      dogOwnerId = body.dogOwnerId;
    } else {
      throw new BadRequestException('ไม่สามารถยืนยันการจองสำหรับ role นี้ได้');
    }

    return this.createReservationUsecase.execute(
      body,
      dogOwnerId,
      user.id,
      user.role === ROLE.STAFF,
    );
  }

  @Post('cancel')
  @UseGuards(AccessTokenGuard)
  async cancelReservation(
    @Body() body: CancelReservationRequest,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ success: boolean }> {
    let dogOwnerId: number;
    let performedByStaff: boolean;

    if (user.role === ROLE.DOG_OWNER) {
      dogOwnerId = user.id;
      performedByStaff = false;
    } else if (user.role === ROLE.STAFF) {
      if (body.dogOwnerId == null) {
        throw new BadRequestException(
          'กรุณาระบุ dogOwnerId เมื่อยกเลิกจากฝั่ง staff',
        );
      }
      if (!body.cancelReason?.trim()) {
        throw new BadRequestException(
          'กรุณาระบุหมายเหตุเหตุผลที่ยกเลิกเมื่อยกเลิกโดยพนักงาน',
        );
      }
      dogOwnerId = body.dogOwnerId;
      performedByStaff = true;
    } else {
      throw new BadRequestException('ไม่สามารถยกเลิกการจองสำหรับ role นี้ได้');
    }

    return this.cancelReservationUsecase.execute(
      body.code,
      dogOwnerId,
      performedByStaff,
      body.cancelReason,
    );
  }

  @Post('approve')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async approveReservation(
    @Body() body: ApproveReservationRequest,
    @StaffDecorator() user: IUser,
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
    @Body('dogOwnerId') bodyDogOwnerId: number | undefined,
    @UploadedFile() file: Express.Multer.File,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ slipUrl: string }> {
    if (!code || typeof code !== 'string') {
      throw new BadRequestException('กรุณาระบุ code การจอง');
    }
    if (!file?.buffer) {
      throw new BadRequestException('กรุณาแนบไฟล์รูปภาพ');
    }

    let dogOwnerId: number;
    const performedByUserId = user.id;
    let performedByStaff = false;

    if (user.role === ROLE.DOG_OWNER) {
      dogOwnerId = user.id;
      performedByStaff = false;
    } else if (user.role === ROLE.STAFF) {
      if (bodyDogOwnerId == null) {
        throw new BadRequestException(
          'กรุณาระบุ dogOwnerId เมื่อแนบสลิปจากฝั่ง staff',
        );
      }
      dogOwnerId = bodyDogOwnerId;
      performedByStaff = true;
    } else {
      throw new BadRequestException('ไม่สามารถแนบสลิปสำหรับ role นี้ได้');
    }

    return this.uploadPaymentSlipUsecase.execute(
      code,
      dogOwnerId,
      performedByUserId,
      performedByStaff,
      file,
    );
  }
  @Post('slip/verify')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async verifySlip(
    @Body() body: VerifySlipRequest,
  ): Promise<{ success: boolean }> {
    return this.verifyPaymentSlipUsecase.execute(body.code, body.dogOwnerId);
  }

  @Post('checkin')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async checkIn(
    @Body() body: CheckInReservationRequest,
  ): Promise<{ success: boolean }> {
    return this.checkInReservationUsecase.execute(body.code, body.dogOwnerId);
  }

  @Post('checkout')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async checkOut(
    @Body() body: CheckOutReservationRequest,
  ): Promise<{ success: boolean }> {
    return this.checkOutReservationUsecase.execute(body.code, body.dogOwnerId);
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
