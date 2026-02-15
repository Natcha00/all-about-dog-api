import { BadRequestException, Injectable } from '@nestjs/common';
import { DogOwnerRepository } from './dog-owner.repository';
import { CreateDogOwnerDto } from './dtos/create-dog-owner.dto';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { UserService } from 'src/user/user.service';
import { ROLE } from 'src/user/enums/role.enum';

@Injectable()
export class DogOwnerService {
  constructor(private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly userService: UserService) {}

  async createDogOwner(createDogOwnerDto: CreateDogOwnerDto) {
    const dogOwner = this.dogOwnerRepository.initiate({
      firstName: createDogOwnerDto.firstName,
      lastname: createDogOwnerDto.lastName,
      email: createDogOwnerDto.email,
    //   password: createDogOwnerDto.password,
      phoneNumber: createDogOwnerDto.phoneNumber,
      address: createDogOwnerDto.address,
    //   profilePictureUrl: createDogOwnerDto.profilePictureUrl,
    });
    await this.dogOwnerRepository.insert(dogOwner);
  }

  async register(registerDto:RegisterDto){
    const checkEmail = await this.dogOwnerRepository.findOneByEmail(registerDto.email)
    if (checkEmail) {
      throw new BadRequestException("Dog Owner already exits")
    }
    const hashPassword = await bcrypt.hash(registerDto.password,10)
    const dogOwner = this.dogOwnerRepository.initiate({
      firstName: registerDto.firstName,
      lastname: registerDto.lastName,
      email: registerDto.email,
      password: hashPassword,
      phoneNumber: registerDto.phoneNumber,
      address: registerDto.address,
      profilePictureUrl: registerDto.profilePictureUrl,
    }); 
    await this.dogOwnerRepository.insert(dogOwner);
}

  async getAll(){
    await this.dogOwnerRepository.findAll()
  }

  async getById(id:number){
    return await this.dogOwnerRepository.findById(id)
  }

async login(loginDto:LoginDto){
  const foundDogOwner = await this.dogOwnerRepository.findOneByEmail(loginDto.email)
  if (!foundDogOwner) {
    throw new BadRequestException("email or passord incorrect")
  }
  const isMatch = await bcrypt.compare(loginDto.password, foundDogOwner.password)
  if (!isMatch) {
    throw new BadRequestException("email or passord incorrect")
  }
  const accessToken = await this.userService.signAccessToken({
    id:foundDogOwner.id,
    role:ROLE.DOG_OWNER
  })

  const refreshToken = await this.userService.signRefreshToken({
    id:foundDogOwner.id,
    role:ROLE.DOG_OWNER
  })
  
  return {
    accessToken,
    refreshToken
  }
}
}
