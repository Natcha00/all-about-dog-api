import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DogService } from './services/dog.service';
import { CreateDogDto } from './dtos/create-dog.dto';
import { CreateBreedDto } from './dtos/create-breed.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { type IUser } from 'src/user/interfaces/user.interface';
import { GetDogByOwnerUsecase } from './use-cases/get-dog-by-owner.use-case';
import { CreateDogUsecase } from './use-cases/create-dog.use-case';
import { GetDogProfileUsecase } from './use-cases/get-dog-profile.use-case';
import { GetDogProfileResponse } from './dtos/get-dog-profile.dto';
import { CreateVaccinationRecordDto } from './dtos/create-vaccination-record.dto';
import { CreateVaccinationRecordUsecase } from './use-cases/create-vaccination-record.use-case';
import { GetBreedsUsecase } from './use-cases/get-breeds.use-case';
import { BloodGroup } from './enums/blood-group.enum';
import { ROLE } from 'src/user/enums/role.enum';

@Controller('dog')
export class DogController {
  constructor(
    private readonly createDogUsecase: CreateDogUsecase,
    private readonly getDogByOwnerUsecase: GetDogByOwnerUsecase,
    private readonly getDogProfileUsecase: GetDogProfileUsecase,
    private readonly createVaccinationRecordUsecase: CreateVaccinationRecordUsecase,
    private readonly getBreedsUsecase: GetBreedsUsecase,
  ) {}

  @Post('/create-dog')
  @UseGuards(AccessTokenGuard)
  async create(
    @Body() createDogDto: CreateDogDto,
    @DogOwnerDecorator() user: IUser,
  ) {
    const dogOwnerId = this.resolveDogOwnerId(
      user,
      createDogDto.dogOwnerId,
      'create-dog',
    );
    return await this.createDogUsecase.execute(createDogDto, dogOwnerId);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getDogs(
    @Query('dogOwnerId') dogOwnerIdQuery: string | undefined,
    @DogOwnerDecorator() user: IUser,
  ) {
    const dogOwnerId = this.resolveDogOwnerIdFromQuery(
      user,
      dogOwnerIdQuery,
      'getDogs',
    );
    return await this.getDogByOwnerUsecase.execute(dogOwnerId);
  }

  @Get('options/blood-groups')
  @UseGuards(AccessTokenGuard)
  getBloodGroups(): { value: string; label: string }[] {
    return Object.values(BloodGroup).map((value) => ({ value, label: value }));
  }

  @Get('breeds')
  @UseGuards(AccessTokenGuard)
  async getBreeds() {
    return await this.getBreedsUsecase.execute();
  }

  @Get(':id/profile')
  @UseGuards(AccessTokenGuard)
  async getProfile(
    @Param('id') dogId: string,
    @Query('dogOwnerId') dogOwnerIdQuery: string | undefined,
    @DogOwnerDecorator() user: IUser,
  ): Promise<GetDogProfileResponse> {
    const dogOwnerId = this.resolveDogOwnerIdFromQuery(
      user,
      dogOwnerIdQuery,
      'getProfile',
    );
    return await this.getDogProfileUsecase.execute(Number(dogId), dogOwnerId);
  }

  @Post(':id/vaccinations')
  @UseGuards(AccessTokenGuard)
  async addVaccination(
    @Param('id') dogId: string,
    @Body() createVaccinationRecordDto: CreateVaccinationRecordDto,
    @DogOwnerDecorator() user: IUser,
  ) {
    const dogOwnerId = this.resolveDogOwnerId(
      user,
      createVaccinationRecordDto.dogOwnerId,
      'addVaccination',
    );
    return await this.createVaccinationRecordUsecase.execute(
      Number(dogId),
      dogOwnerId,
      createVaccinationRecordDto,
    );
  }

  private resolveDogOwnerId(
    user: IUser,
    value: number | undefined,
    endpoint: string,
  ): number {
    if (user.role === ROLE.DOG_OWNER) {
      return user.id;
    }
    if (user.role === ROLE.STAFF) {
      if (value == null) {
        throw new BadRequestException(
          `กรุณาระบุ dogOwnerId เมื่อเรียก ${endpoint} จากฝั่ง staff`,
        );
      }
      return value;
    }
    throw new BadRequestException(`ไม่สามารถเรียก ${endpoint} สำหรับ role นี้ได้`);
  }

  private resolveDogOwnerIdFromQuery(
    user: IUser,
    queryValue: string | undefined,
    endpoint: string,
  ): number {
    if (user.role === ROLE.DOG_OWNER) {
      return user.id;
    }
    if (user.role === ROLE.STAFF) {
      const id = queryValue != null ? Number(queryValue) : NaN;
      if (!Number.isInteger(id) || id < 1) {
        throw new BadRequestException(
          `กรุณาระบุ dogOwnerId เมื่อเรียก ${endpoint} จากฝั่ง staff`,
        );
      }
      return id;
    }
    throw new BadRequestException(`ไม่สามารถเรียก ${endpoint} สำหรับ role นี้ได้`);
  }
}
