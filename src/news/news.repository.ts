import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { News } from "./entities/news.entity";

@Injectable()
export class NewsRepository {
    constructor(
        @InjectRepository(News)
        private readonly repo: Repository<News>,
    ) {}
    createBanner(banner: Partial<News>): News {
        return this.repo.create(banner);
    }
    async saveBanner(banner: News): Promise<News> {
        return await this.repo.save(banner);
    }
    async findBannerAll(): Promise<{ id: number, imageUrl: string }[]> {
        return await this.repo.find({ where: { deletedAt: IsNull() } });
    }
    async deleteBanner(id: number): Promise<void> {
        await this.repo.softDelete(id);
    }
}