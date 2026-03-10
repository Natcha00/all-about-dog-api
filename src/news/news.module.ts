import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { CreateBannerUsecase } from './use-cases/create-banner.use-case';
import { News } from './entities/news.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsRepository } from './news.repository';
import { GetBannerUsecase } from './use-cases/get-banner.usecase';
import { DeleteBannerUsecase } from './use-cases/delete-banner.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  controllers: [NewsController],
  providers: [NewsService, CreateBannerUsecase, NewsRepository, GetBannerUsecase, DeleteBannerUsecase],
  
})
export class NewsModule {}
