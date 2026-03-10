import { Injectable, NotFoundException } from "@nestjs/common";
import { News } from "../entities/news.entity";
import { NewsRepository } from "../news.repository";

@Injectable()
export class GetBannerUsecase {
    constructor(private readonly newsRepository: NewsRepository) {}

    async execute(): Promise<{ id: number, imageUrl: string }[]> {
    const banners = await this.newsRepository.findBannerAll();
        if (!banners) {
            throw new NotFoundException('Banner not found');
        }
        return banners.map(banner => ({
            id: banner.id,
            imageUrl: banner.imageUrl
        }));
    }
}