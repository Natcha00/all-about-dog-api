import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DogRepository } from '../dog.repository';
import { DoSpacesService } from 'src/storage/do-spaces.service';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadDogProfilePictureUsecase {
  constructor(
    private readonly dogRepository: DogRepository,
    private readonly doSpacesService: DoSpacesService,
  ) {}

  async execute(
    dogId: number,
    dogOwnerId: number,
    file: Express.Multer.File,
  ): Promise<{ dogPictureUrl: string }> {
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

    const dog = await this.dogRepository.findOneByIdAndDogOwnerId(
      dogId,
      dogOwnerId,
    );
    if (!dog) {
      throw new NotFoundException('ไม่พบสุนัขหรือไม่มีสิทธิ์แก้ไข');
    }

    const ext =
      mime === 'image/jpeg' || mime === 'image/jpg'
        ? 'jpg'
        : (mime.split('/')[1] ?? 'jpg');
    const key = `dog-profile/${dogId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const dogPictureUrl = await this.doSpacesService.upload(
      key,
      file.buffer,
      mime,
    );

    dog.dogPictureUrl = dogPictureUrl;
    await this.dogRepository.save(dog);

    return { dogPictureUrl };
  }
}
