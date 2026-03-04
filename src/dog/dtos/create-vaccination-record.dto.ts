import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsInt, Min } from "class-validator";

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

/** สำหรับ staff: ระบุ dogOwnerId ของเจ้าของสุนัข */
@IsOptional()
@IsInt()
@Min(1)
dogOwnerId?: number;
}