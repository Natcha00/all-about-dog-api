import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsInt, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";
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
@Type(() => Number)
dose: number;

@IsString()
@IsOptional()
clinicName: string;



/** สำหรับ staff: ระบุ dogOwnerId ของเจ้าของสุนัข */
@IsOptional()
@IsInt()
@Min(1)
@Type(() => Number)
dogOwnerId?: number;
}