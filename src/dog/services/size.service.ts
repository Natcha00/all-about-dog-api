import { Injectable } from "@nestjs/common";
import { SizeRepository } from "../repositories/size.repository";
import { CreateSizeDto } from "../dtos/create-size.dto";

@Injectable()
export class SizeService{
    constructor(private readonly sizeRepository:SizeRepository){}

    async create(createSizeDto:CreateSizeDto){ //Size of Dto
        const size = this.sizeRepository.initiate({size:createSizeDto.size})
        await this.sizeRepository.insert(size)
    }
    async getAll(){
        return await this.sizeRepository.findAll()
    }
}