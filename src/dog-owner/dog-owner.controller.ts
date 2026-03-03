import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DogOwnerService } from './dog-owner.service';
import { CreateDogOwnerDto } from './dtos/create-dog-owner.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginRequest } from './dtos/login.dto';
import { SearchDogOwnerRequest, SearchDogOwnerItemDto } from './dtos/search-dog-owner.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDecorator } from 'src/user/decorators/dog-owner.decorator';
import { StaffGuard } from 'src/staff/guards/staff.guard';
import { DogOwnerGuard } from 'src/user/guards/dog-owner.guard';

@Controller('dog-owner')
export class DogOwnerController {
  constructor(private readonly dogOwnerService: DogOwnerService) {}

  @Get()
  findDogOwners() {
    return this.dogOwnerService.getAll();
  }

  @Get('search')
  @UseGuards(AccessTokenGuard, StaffGuard)
  async search(
    @Query() query: SearchDogOwnerRequest,
  ): Promise<SearchDogOwnerItemDto[]> {
    return this.dogOwnerService.search(query.keyword);
  }

  @Post('create-dog-owner')
  async create(@Body() createDogOwnerDto: CreateDogOwnerDto) {
    await this.dogOwnerService.createDogOwner(createDogOwnerDto);
    return
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.dogOwnerService.register(registerDto);
    return
  }
  
  @Post('login')
  async login(@Body() loginRequest: LoginRequest) {
    return await this.dogOwnerService.login(loginRequest);
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard, DogOwnerGuard)
  async profile(@DogOwnerDecorator() dogOwnerDec){
    return dogOwnerDec
  }

  
}
