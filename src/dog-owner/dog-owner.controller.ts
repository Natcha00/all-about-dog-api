import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CreateDogOwnerDto } from './dtos/create-dog-owner.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginRequest } from './dtos/login.dto';
import { SearchDogOwnerRequest, SearchDogOwnerItemDto } from './dtos/search-dog-owner.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { StaffGuard } from 'src/staff/guards/staff.guard';
import { DogOwnerGuard } from 'src/user/guards/dog-owner.guard';
import { CreateDogOwnerUsecase } from './use-cases/create-dog-owner.use-case';
import { RegisterDogOwnerUsecase } from './use-cases/register-dog-owner.use-case';
import { LoginDogOwnerUsecase } from './use-cases/login-dog-owner.use-case';
import { GetAllDogOwnersUsecase } from './use-cases/get-all-dog-owners.use-case';
import { GetDogOwnerByIdUsecase } from './use-cases/get-dog-owner-by-id.use-case';
import { SearchDogOwnerUsecase } from './use-cases/search-dog-owner.use-case';
import { type IUser } from 'src/user/interfaces/user.interface';

@Controller('dog-owner')
export class DogOwnerController {
  constructor(
    private readonly createDogOwnerUsecase: CreateDogOwnerUsecase,
    private readonly registerDogOwnerUsecase: RegisterDogOwnerUsecase,
    private readonly loginDogOwnerUsecase: LoginDogOwnerUsecase,
    private readonly getAllDogOwnersUsecase: GetAllDogOwnersUsecase,
    private readonly getDogOwnerByIdUsecase: GetDogOwnerByIdUsecase,
    private readonly searchDogOwnerUsecase: SearchDogOwnerUsecase,
  ) {}

  @Get('search')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async search(
    @Query() query: SearchDogOwnerRequest,
  ): Promise<SearchDogOwnerItemDto[]> {
    return this.searchDogOwnerUsecase.execute(query.keyword);
  }

  @Post('create')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async create(@Body() body: CreateDogOwnerDto) {
    return this.createDogOwnerUsecase.execute(body);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    await this.registerDogOwnerUsecase.execute(body);
  }

  @Post('login')
  async login(@Body() body: LoginRequest) {
    return this.loginDogOwnerUsecase.execute(body);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard, DogOwnerGuard)
  async me(@DogOwnerDecorator() user: IUser) {
    return user;
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard, DogOwnerGuard)
  async profile(@DogOwnerDecorator() user: IUser) {
    return user;
  }

  @Get('/all')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async getOfferingForDogOwner() {
    return this.getAllDogOwnersUsecase.execute();
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async getDogOwnerById(@Param('id', ParseIntPipe) id: number) {
    const dogOwner = await this.getDogOwnerByIdUsecase.execute(id);
    if (dogOwner == null) {
      throw new NotFoundException('ไม่พบข้อมูลลูกค้า');
    }
    return dogOwner;
  }

}
