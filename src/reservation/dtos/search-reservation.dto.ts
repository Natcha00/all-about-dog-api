import { IsOptional, IsString } from 'class-validator';

export class SearchReservationRequest {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  dogName?: string;

  @IsOptional()
  @IsString()
  dogOwnerName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

