import { BadRequestException, Injectable } from '@nestjs/common';
import { DogOwnerRepository } from './dog-owner.repository';
import { CreateDogOwnerDto } from './dtos/create-dog-owner.dto';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginRequest } from './dtos/login.dto';
import { SearchDogOwnerItemDto } from './dtos/search-dog-owner.dto';
import { UserService } from 'src/user/user.service';
import { ROLE } from 'src/user/enums/role.enum';

@Injectable()
export class DogOwnerService {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly userService: UserService,
  ) {}

  async createDogOwner(createDogOwnerDto: CreateDogOwnerDto) {
    const dogOwner = this.dogOwnerRepository.initiate({
      firstName: createDogOwnerDto.firstName,
      lastName: createDogOwnerDto.lastName,
      email: createDogOwnerDto.email,
      //   password: createDogOwnerDto.password,
      phoneNumber: createDogOwnerDto.phoneNumber,
      address: createDogOwnerDto.address,
      //   profilePictureUrl: createDogOwnerDto.profilePictureUrl,
    });
    await this.dogOwnerRepository.insert(dogOwner);
  }

  async register(registerDto: RegisterDto) {
    const checkEmail = await this.dogOwnerRepository.findOneByEmail(
      registerDto.email,
    );
    if (checkEmail) {
      throw new BadRequestException('Dog Owner already exits');
    }
    const hashPassword = await bcrypt.hash(registerDto.password, 10);
    const dogOwner = this.dogOwnerRepository.initiate({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashPassword,
      phoneNumber: registerDto.phoneNumber,
      address: registerDto.address,
      profilePictureUrl: registerDto.profilePictureUrl,
    });
    await this.dogOwnerRepository.insert(dogOwner);
  }

  async getAll() {
    await this.dogOwnerRepository.findAll();
  }

  async getById(id: number) {
    return await this.dogOwnerRepository.findById(id);
  }

  /** ค้นหา owner จาก keyword (phoneNumber หรือ name) – สำหรับ staff */
  async search(keyword: string): Promise<SearchDogOwnerItemDto[]> {
    const owners = await this.dogOwnerRepository.searchByKeyword(keyword);
    return owners.map((o) => ({
      id: o.id,
      code: o.code,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phoneNumber: o.phoneNumber,
      address: o.address ?? null,
      profilePictureUrl: o.profilePictureUrl ?? null,
    }));
  }

  async login(loginRequest: LoginRequest) {
    const foundDogOwner = await this.dogOwnerRepository.findOneByEmail(
      loginRequest.email,
    );
    if (!foundDogOwner) {
      throw new BadRequestException('email or passord incorrect');
    }
    const isMatch = await bcrypt.compare(
      loginRequest.password,
      foundDogOwner.password,
    );
    // if (!isMatch) {
    //   throw new BadRequestException("email or passord incorrect")
    // }
    const accessToken = await this.userService.signAccessToken({
      id: foundDogOwner.id,
      role: ROLE.DOG_OWNER,
    });

    const refreshToken = await this.userService.signRefreshToken({
      id: foundDogOwner.id,
      role: ROLE.DOG_OWNER,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
