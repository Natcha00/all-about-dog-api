import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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
import { UpdateVaccinationRecordDto } from './dtos/update-vaccination-record.dto';
import { CreateVaccinationRecordUsecase } from './use-cases/create-vaccination-record.use-case';
import { UpdateVaccinationRecordUsecase } from './use-cases/update-vaccination-record.use-case';
import { DeleteVaccinationRecordUsecase } from './use-cases/delete-vaccination-record.use-case';
import { DeleteDogUsecase } from './use-cases/delete-dog.use-case';
import { UploadDogProfilePictureUsecase } from './use-cases/upload-dog-profile-picture.use-case';
import { GetBreedsUsecase } from './use-cases/get-breeds.use-case';
import { BloodGroup } from './enums/blood-group.enum';
import { VaccineType } from './enums/vaccine-type.enum';
import { ROLE } from 'src/user/enums/role.enum';

@Controller('dog')
export class DogController {
  constructor(
    private readonly createDogUsecase: CreateDogUsecase,
    private readonly getDogByOwnerUsecase: GetDogByOwnerUsecase,
    private readonly getDogProfileUsecase: GetDogProfileUsecase,
    private readonly createVaccinationRecordUsecase: CreateVaccinationRecordUsecase,
    private readonly updateVaccinationRecordUsecase: UpdateVaccinationRecordUsecase,
    private readonly deleteVaccinationRecordUsecase: DeleteVaccinationRecordUsecase,
    private readonly deleteDogUsecase: DeleteDogUsecase,
    private readonly uploadDogProfilePictureUsecase: UploadDogProfilePictureUsecase,
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

  @Get('options/vaccine-types')
  @UseGuards(AccessTokenGuard)
  getVaccineTypes(): { value: string; label: string }[] {
    return Object.values(VaccineType).map((value) => ({ value, label: value }));
  }

  @Get('breeds')
  @UseGuards(AccessTokenGuard)
  async getBreeds() {
    return await this.getBreedsUsecase.execute();
  }

  @Put(':id/profile-picture')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadDogProfilePicture(
    @Param('id') dogId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('dogOwnerId') dogOwnerIdBody: string | undefined,
    @DogOwnerDecorator() user: IUser,
  ): Promise<{ dogPictureUrl: string }> {
    const dogOwnerId = this.resolveDogOwnerIdForUpload(
      user,
      dogOwnerIdBody,
      'profile-picture',
    );
    const id = Number(dogId);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('รหัสสุนัขไม่ถูกต้อง');
    }
    return this.uploadDogProfilePictureUsecase.execute(id, dogOwnerId, file);
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async addVaccination(
    @Param('id') dogId: string,
    @Body() createVaccinationRecordDto: CreateVaccinationRecordDto,
    @UploadedFile() file: Express.Multer.File | undefined,
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
      file,
    );
  }

  @Put(':id/vaccinations/:vaccinationId')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateVaccination(
    @Param('id') dogId: string,
    @Param('vaccinationId') vaccinationId: string,
    @Body() updateVaccinationRecordDto: UpdateVaccinationRecordDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @DogOwnerDecorator() user: IUser,
  ) {
    const dogOwnerId = this.resolveDogOwnerId(
      user,
      updateVaccinationRecordDto.dogOwnerId,
      'updateVaccination',
    );
    return await this.updateVaccinationRecordUsecase.execute(
      Number(dogId),
      Number(vaccinationId),
      dogOwnerId,
      updateVaccinationRecordDto,
      file,
    );
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDog(
    @Param('id') dogId: string,
    @Query('dogOwnerId') dogOwnerIdQuery: string | undefined,
    @DogOwnerDecorator() user: IUser,
  ) {
    const dogOwnerId = this.resolveDogOwnerIdFromQuery(
      user,
      dogOwnerIdQuery,
      'deleteDog',
    );
    const id = Number(dogId);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('รหัสสุนัขไม่ถูกต้อง');
    }
    await this.deleteDogUsecase.execute(id, dogOwnerId);
  }

  @Delete(':id/vaccinations/:vaccinationId')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVaccination(
    @Param('id') dogId: string,
    @Param('vaccinationId') vaccinationId: string,
    @Query('dogOwnerId') dogOwnerIdQuery: string | undefined,
    @DogOwnerDecorator() user: IUser,
  ) {
    const dogOwnerId = this.resolveDogOwnerIdFromQuery(
      user,
      dogOwnerIdQuery,
      'removeVaccination',
    );
    await this.deleteVaccinationRecordUsecase.execute(
      Number(dogId),
      Number(vaccinationId),
      dogOwnerId,
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
    if (user.role === ROLE.STAFF || user.role === ROLE.ADMIN) {
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
    if (user.role === ROLE.STAFF || user.role === ROLE.ADMIN) {
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

  private resolveDogOwnerIdForUpload(
    user: IUser,
    bodyValue: string | undefined,
    endpoint: string,
  ): number {
    if (user.role === ROLE.DOG_OWNER) {
      return user.id;
    }
    if (user.role === ROLE.STAFF || user.role === ROLE.ADMIN) {
      const id = bodyValue != null ? Number(bodyValue) : NaN;
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
