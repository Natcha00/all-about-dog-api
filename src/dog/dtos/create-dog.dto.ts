export class CreateDogDto {
  name: string;
  gender: string;
  breedId: number;
  color: string;
  weight: number;
  height: number;
  birthdate: Date;
  healthInfo: {
    sterilization: boolean;
    microchip: boolean;
    bloodGroup: string;
    underlyingDisease: string;
    allergy: string;
    hasBreakfast: boolean;
    hasAfterBreakfast: boolean;
    hasLunch: boolean;
    hasAfterLunch: boolean;
    hasDinner: boolean;
    detail : string
  };
}
