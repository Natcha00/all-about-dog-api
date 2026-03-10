import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class StaffLoginRequest {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ username' })
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ password' })
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class StaffLoginResponse {
  accessToken: string;
  refreshToken: string;
}

export class StaffRefreshTokenRequest {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ refreshToken' })
  refreshToken: string;
}
