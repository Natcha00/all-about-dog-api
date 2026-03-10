import { BadRequestException, Injectable } from "@nestjs/common";
import { NewsRepository } from "../news.repository";
import { DoSpacesService } from "src/storage/do-spaces.service";
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
@Injectable()
export class CreateBannerUsecase {
    constructor(private readonly newsRepository: NewsRepository, private readonly doSpacesService: DoSpacesService) {}

    async execute(file: Express.Multer.File): Promise<void> {
        if (!file?.buffer) {
            throw new BadRequestException('กรุณาแนบไฟล์รูปภาพ');
          }
          const mime = file.mimetype?.toLowerCase();
          if (!mime || !ALLOWED_MIMES.includes(mime)) {
            throw new BadRequestException('รองรับเฉพาะไฟล์รูปภาพ (jpeg, png, webp)');
          }
          if (file.size > MAX_SIZE_BYTES) {
            throw new BadRequestException('ขนาดไฟล์ไม่เกิน 5 MB');
          }
      
          const ext =
            mime === 'image/jpeg' || mime === 'image/jpg'
              ? 'jpg'
              : (mime.split('/')[1] ?? 'jpg');
          const key = `vaccination-evidence/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
      
          const bannerUrl = await this.doSpacesService.upload(
            key,
            file.buffer,
            mime,
          );
          
          const banner = await this.newsRepository.createBanner({ 
            imageUrl: bannerUrl
           });
          await this.newsRepository.saveBanner(banner);
        }

    
}