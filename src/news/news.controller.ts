import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  NotFoundException,
  UploadedFile,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { EditBannerUsecase } from 'src/staff/use-cases/edit-banner.use-case';
import { CreateBannerUsecase } from './use-cases/create-banner.use-case';
import { AdminGuard } from 'src/staff/guards/admin.guard';
import { GetBannerUsecase } from './use-cases/get-banner.usecase';
import { DeleteBannerUsecase } from './use-cases/delete-banner.use-case';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly createBannerUsecase: CreateBannerUsecase,
    private readonly getBannerUsecase: GetBannerUsecase,
    private readonly deleteBannerUsecase: DeleteBannerUsecase,
  ) {}

  @Post('/edit-banner')
  @UseGuards(AccessTokenGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async editBanner(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new NotFoundException('File is required');
    }
    return this.createBannerUsecase.execute(file);
  }

  @Get('banner')

  async getBanner(): Promise<{ id: number, imageUrl: string }[]> {
    return this.getBannerUsecase.execute();
  }


  @Delete('banner/:id')
  @UseGuards(AccessTokenGuard, AdminGuard)
  async removeBanner(@Param('id') id: string) {
    return this.deleteBannerUsecase.execute(Number(id));
  }
}
