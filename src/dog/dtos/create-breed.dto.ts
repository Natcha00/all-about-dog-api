import { Size } from "../enums/size.enum";

export class CreateBreedDto {
    breedId: number
    nameTh: string;
    nameEng: string;
    size:Size
}
