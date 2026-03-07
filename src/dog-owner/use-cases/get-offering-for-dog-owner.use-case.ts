import { Injectable } from "@nestjs/common";
import { DogOwnerRepository } from "../dog-owner.repository";

@Injectable()
export class GetAllDogOwnersUsecase {
    constructor(private readonly dogOwnerRepository: DogOwnerRepository) {}

    async execute() {
        return await this.dogOwnerRepository.getAllDogOwners();
    }
}