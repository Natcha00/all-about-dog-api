import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

export class LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenRequest {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ refreshToken' })
  refreshToken: string;
}
