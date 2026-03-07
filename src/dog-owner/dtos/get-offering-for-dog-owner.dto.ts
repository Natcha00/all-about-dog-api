import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetOfferingForDogOwnerRequest {

    @IsInt()
    @IsNotEmpty()
    dogOwnerId: number;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;
}