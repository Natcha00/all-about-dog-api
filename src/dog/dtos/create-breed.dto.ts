import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Size } from "../enums/size.enum";

export class CreateBreedDto {
    @IsNumber()
    @IsNotEmpty()
    breedId: number

    @IsString()
    @IsNotEmpty()
    nameTh: string;

    @IsString()
    @IsNotEmpty()
    nameEng: string;

    @IsEnum(Size)
    @IsNotEmpty()
    size:Size
}
