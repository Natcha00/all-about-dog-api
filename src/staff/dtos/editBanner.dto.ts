import { IsNotEmpty, IsString } from "class-validator";

export class EditBannerDto {
  @IsString()
  @IsNotEmpty()
  bannerUrl: string;
}