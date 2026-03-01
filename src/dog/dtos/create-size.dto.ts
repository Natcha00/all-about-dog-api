import { IsNotEmpty, IsString } from "class-validator";

export class CreateSizeDto {
    @IsString()
    @IsNotEmpty()
    size:string
}