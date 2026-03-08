import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DogOwnerRepository } from '../dog-owner.repository';
import { DoSpacesService } from 'src/storage/do-spaces.service';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UpdateDogOwnerProfilePictureUsecase {
  constructor(
    private readonly dogOwnerRepository: DogOwnerRepository,
    private readonly doSpacesService: DoSpacesService,
  ) {}

  async execute(
    dogOwnerId: number,
    file: Express.Multer.File,
  ): Promise<{ profilePictureUrl: string }> {
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

    const owner = await this.dogOwnerRepository.findById(dogOwnerId);
    if (!owner) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');
    }

    const ext =
      mime === 'image/jpeg' || mime === 'image/jpg'
        ? 'jpg'
        : (mime.split('/')[1] ?? 'jpg');
    const key = `dog-owner-profile/${dogOwnerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const profilePictureUrl = await this.doSpacesService.upload(
      key,
      file.buffer,
      mime,
    );

    owner.profilePictureUrl = profilePictureUrl;
    await this.dogOwnerRepository.insert(owner);

    return { profilePictureUrl };
  }
}
