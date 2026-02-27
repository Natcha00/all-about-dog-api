import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
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

@Controller('dog')
export class DogController {
  constructor(
    private readonly createDogUsecase: CreateDogUsecase,
    private readonly getDogByOwnerUsecase: GetDogByOwnerUsecase,
    private readonly getDogProfileUsecase: GetDogProfileUsecase,
  ) {}

  @Post('/create-dog')
  @UseGuards(AccessTokenGuard)
  async create(
    @Body() createDogDto: CreateDogDto,
    @DogOwnerDecorator() dogOwner: IUser,
  ) {
    return await this.createDogUsecase.execute(createDogDto, dogOwner.id);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getDogs(@DogOwnerDecorator() dogOwner: IUser) {
    return await this.getDogByOwnerUsecase.execute(dogOwner.id);
  }

  @Get(':id/profile')
  @UseGuards(AccessTokenGuard)
  async getProfile(
    @Param('id') dogId: string,
    @DogOwnerDecorator() dogOwner: IUser,
  ): Promise<GetDogProfileResponse> {
    return await this.getDogProfileUsecase.execute(
      Number(dogId),
      dogOwner.id,
    );

  }
}
