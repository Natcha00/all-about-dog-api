import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDogOwnerRequest {
  @IsString()
  @IsNotEmpty()
  keyword: string;
}

/** ผลลัพธ์การค้นหา (ไม่รวม password) */
export class SearchDogOwnerItemDto {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  profilePictureUrl: string | null;
}
