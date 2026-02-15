import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { DogService } from './services/dog.service';
import { CreateDogDto } from './dtos/create-dog.dto';
import { UpdateDogDto } from './dtos/update-dog.dto';
import { SizeService } from './services/size.service';
import { CreateSizeDto } from './dtos/create-size.dto';
import { CreateBreedDto } from './dtos/create-breed.dto';
import { BreedService } from './services/breed.service';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { DogOwnerDec } from 'src/user/decorators/dog-owner.decorator';

@Controller('dog')
export class DogController {
  constructor(
    private readonly dogService: DogService,
    private readonly sizeService: SizeService,
    private readonly breedService: BreedService
  ) {}

  @Post('size')
  createSize(@Body() createSize: CreateSizeDto) {
    return this.sizeService.create(createSize);
  }
  @Post('breed')
  createBreed(@Body() createBreedDto: CreateBreedDto) {
    return this.breedService.create(createBreedDto);
  }

  @Post()
  @UseGuards(AccessTokenGuard) 
  create(@Body() createDogDto: CreateDogDto, @DogOwnerDec() dogOwnerDec) {
    return this.dogService.create(createDogDto, dogOwnerDec);
  }
  
  @Get('breed')
  findBreedAll() {
    return this.breedService.getAll();
  }
  @Get('size')
  findSizeAll() {
    return this.sizeService.getAll();
  }
  @Get()
  findAll() {
    return this.dogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDogDto: UpdateDogDto) {
    return this.dogService.update(+id, updateDogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dogService.remove(+id);
  }
}
