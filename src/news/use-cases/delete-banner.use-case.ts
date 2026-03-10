import { Injectable } from "@nestjs/common";
import { NewsRepository } from "../news.repository";

@Injectable()
export class DeleteBannerUsecase {
    constructor(private readonly newsRepository: NewsRepository) {}

    async execute(id: number): Promise<void> {
        await this.newsRepository.deleteBanner(id);
    }
}