import { BadRequestException, Injectable } from "@nestjs/common";
import { StaffRepository } from "../staff.repository";

@Injectable()
export class EditBannerUsecase {
    constructor(private readonly staffRepository: StaffRepository) {}

    async execute(file: Express.Multer.File): Promise<void> {
       
    }
}