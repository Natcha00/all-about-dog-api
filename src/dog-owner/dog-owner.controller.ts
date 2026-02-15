import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DogOwnerService } from './dog-owner.service';
import { CreateDogOwnerDto } from './dtos/create-dog-owner.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDec } from 'src/user/decorators/dog-owner.decorator';

@Controller('dog-owner')
export class DogOwnerController {
  constructor(private readonly dogOwnerService: DogOwnerService) {}

  @Get('dog-owner')
  findDogOwners() {
    return this.dogOwnerService.getAll();
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
  async login(@Body() loginDto: LoginDto) {
    return await this.dogOwnerService.login(loginDto);
    
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  async profile(@DogOwnerDec() dogOwnerDec){
    return dogOwnerDec
  }
}
