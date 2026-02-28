import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateVaccinationRecordDto {

@IsString()
@IsNotEmpty()
vaccinationDate: string;


@IsString()
@IsNotEmpty()
vaccineName: string;


@IsNumber()
@IsNotEmpty()
dose: number;

@IsString()
@IsOptional()
clinicName: string;

@IsString()
@IsOptional()
@IsUrl()
evidenceImageUrl: string;
}