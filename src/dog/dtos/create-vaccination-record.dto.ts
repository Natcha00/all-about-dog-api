import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsInt, Min, IsEnum } from "class-validator";
import { VaccineType } from "../enums/vaccine-type.enum";

export class CreateVaccinationRecordDto {

@IsString()
@IsNotEmpty()
vaccinationDate: string;


@IsEnum(VaccineType)
@IsNotEmpty()
vaccineName: VaccineType;


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

/** สำหรับ staff: ระบุ dogOwnerId ของเจ้าของสุนัข */
@IsOptional()
@IsInt()
@Min(1)
dogOwnerId?: number;
}