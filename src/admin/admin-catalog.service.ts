import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Breed } from 'src/dog/entities/breed.entity';
import { Dog } from 'src/dog/entities/dog.entity';
import { OfferBreedPricing } from 'src/offering/entities/offer-breed-pricing.entity';
import { OfferCoatPricing } from 'src/offering/entities/offer-coat-pricing.entity';
import { OfferSizePricing } from 'src/offering/entities/offer-size-pricing.entity';
import { OfferVipPricing } from 'src/offering/entities/offer-vip-pricing.entity';
import { Offering } from 'src/offering/entities/offering.entity';
import {
  OFFERING_ID,
  offeringIdForBoardingSize,
} from 'src/offering/constants/offering-ids.constant';
import {
  CreateBreedAdminDto,
  CreateOfferBreedPricingAdminDto,
  CreateOfferCoatPricingAdminDto,
  CreateOfferSizePricingAdminDto,
  CreateOfferVipPricingAdminDto,
  UpdateBreedAdminDto,
  UpdateOfferBreedPricingAdminDto,
  UpdateOfferCoatPricingAdminDto,
  UpdateOfferSizePricingAdminDto,
  UpdateOfferVipPricingAdminDto,
} from './dtos/admin-catalog.dto';

@Injectable()
export class AdminCatalogService {
  constructor(
    @InjectRepository(Breed)
    private readonly breedRepo: Repository<Breed>,
    @InjectRepository(Dog)
    private readonly dogRepo: Repository<Dog>,
    @InjectRepository(OfferBreedPricing)
    private readonly offerBreedPricingRepo: Repository<OfferBreedPricing>,
    @InjectRepository(OfferCoatPricing)
    private readonly offerCoatPricingRepo: Repository<OfferCoatPricing>,
    @InjectRepository(OfferSizePricing)
    private readonly offerSizePricingRepo: Repository<OfferSizePricing>,
    @InjectRepository(OfferVipPricing)
    private readonly offerVipPricingRepo: Repository<OfferVipPricing>,
  ) {}

  // --- Breed ---
  async findAllBreeds() {
    return this.breedRepo.find({ order: { id: 'ASC' } });
  }

  async findOneBreed(id: number) {
    const row = await this.breedRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Breed ${id} not found`);
    return row;
  }

  async createBreed(dto: CreateBreedAdminDto) {
    const entity = this.breedRepo.create({
      nameTh: dto.nameTh,
      nameEng: dto.nameEng,
      size: dto.size,
    });
    return this.breedRepo.save(entity);
  }

  async updateBreed(id: number, dto: UpdateBreedAdminDto) {
    const row = await this.findOneBreed(id);
    Object.assign(row, dto);
    return this.breedRepo.save(row);
  }

  async removeBreed(id: number) {
    await this.findOneBreed(id);
    const dogCount = await this.dogRepo.count({ where: { breed: { id } } });
    if (dogCount > 0) {
      throw new ConflictException(
        'Cannot delete breed while dogs reference it',
      );
    }
    const pricing = await this.offerBreedPricingRepo.findOne({
      where: { breed: { id } },
    });
    if (pricing) {
      throw new ConflictException(
        'Remove offer breed pricing for this breed first',
      );
    }
    await this.breedRepo.delete(id);
    return { deleted: true, id };
  }

  // --- Offer breed pricing ---
  async findAllOfferBreedPricing() {
    return this.offerBreedPricingRepo.find({
      relations: { breed: true, offering: true },
      order: { id: 'ASC' },
    });
  }

  async findOneOfferBreedPricing(id: number) {
    const row = await this.offerBreedPricingRepo.findOne({
      where: { id },
      relations: { breed: true, offering: true },
    });
    if (!row) throw new NotFoundException(`OfferBreedPricing ${id} not found`);
    return row;
  }

  async createOfferBreedPricing(dto: CreateOfferBreedPricingAdminDto) {
    const existing = await this.offerBreedPricingRepo.findOne({
      where: { breed: { id: dto.breedId } },
    });
    if (existing) {
      throw new ConflictException(
        'This breed already has an offer breed pricing row',
      );
    }
    const entity = this.offerBreedPricingRepo.create({
      normalPrice: dto.normalPrice,
      specialPrice: dto.specialPrice,
      minWeightKg: dto.minWeightKg ?? null,
      maxWeightKg: dto.maxWeightKg ?? null,
      offering: { id: OFFERING_ID.SWIMMING },
      breed: { id: dto.breedId },
    });
    return this.offerBreedPricingRepo.save(entity);
  }

  async updateOfferBreedPricing(id: number, dto: UpdateOfferBreedPricingAdminDto) {
    const row = await this.findOneOfferBreedPricing(id);
    if (dto.breedId != null && dto.breedId !== row.breed?.id) {
      const taken = await this.offerBreedPricingRepo.findOne({
        where: { breed: { id: dto.breedId } },
      });
      if (taken && taken.id !== id) {
        throw new ConflictException(
          'Target breed already has an offer breed pricing row',
        );
      }
    }
    if (dto.normalPrice !== undefined) row.normalPrice = dto.normalPrice;
    if (dto.specialPrice !== undefined) row.specialPrice = dto.specialPrice;
    if (dto.minWeightKg !== undefined) row.minWeightKg = dto.minWeightKg;
    if (dto.maxWeightKg !== undefined) row.maxWeightKg = dto.maxWeightKg;
    row.offering = { id: OFFERING_ID.SWIMMING } as Offering;
    if (dto.breedId != null) {
      row.breed = { id: dto.breedId } as Breed;
    }
    return this.offerBreedPricingRepo.save(row);
  }

  async removeOfferBreedPricing(id: number) {
    await this.findOneOfferBreedPricing(id);
    await this.offerBreedPricingRepo.delete(id);
    return { deleted: true, id };
  }

  // --- Offer coat pricing ---
  async findAllOfferCoatPricing() {
    return this.offerCoatPricingRepo.find({
      relations: { offering: true },
      order: { id: 'ASC' },
    });
  }

  async findOneOfferCoatPricing(id: number) {
    const row = await this.offerCoatPricingRepo.findOne({
      where: { id },
      relations: { offering: true },
    });
    if (!row) throw new NotFoundException(`OfferCoatPricing ${id} not found`);
    return row;
  }

  async createOfferCoatPricing(dto: CreateOfferCoatPricingAdminDto) {
    const entity = this.offerCoatPricingRepo.create({
      coat: dto.coat,
      minWeightKg: dto.minWeightKg,
      maxWeightKg: dto.maxWeightKg ?? null,
      price: dto.price,
      offering: { id: OFFERING_ID.SWIMMING },
    });
    return this.offerCoatPricingRepo.save(entity);
  }

  async updateOfferCoatPricing(id: number, dto: UpdateOfferCoatPricingAdminDto) {
    const row = await this.findOneOfferCoatPricing(id);
    if (dto.coat !== undefined) row.coat = dto.coat;
    if (dto.minWeightKg !== undefined) row.minWeightKg = dto.minWeightKg;
    if (dto.maxWeightKg !== undefined) row.maxWeightKg = dto.maxWeightKg;
    if (dto.price !== undefined) row.price = dto.price;
    row.offering = { id: OFFERING_ID.SWIMMING } as Offering;
    return this.offerCoatPricingRepo.save(row);
  }

  async removeOfferCoatPricing(id: number) {
    await this.findOneOfferCoatPricing(id);
    await this.offerCoatPricingRepo.delete(id);
    return { deleted: true, id };
  }

  // --- Offer size pricing ---
  async findAllOfferSizePricing() {
    return this.offerSizePricingRepo.find({
      relations: { offering: true },
      order: { id: 'ASC' },
    });
  }

  async findOneOfferSizePricing(id: number) {
    const row = await this.offerSizePricingRepo.findOne({
      where: { id },
      relations: { offering: true },
    });
    if (!row) throw new NotFoundException(`OfferSizePricing ${id} not found`);
    return row;
  }

  async createOfferSizePricing(dto: CreateOfferSizePricingAdminDto) {
    const offeringId = offeringIdForBoardingSize(dto.size);
    const existing = await this.offerSizePricingRepo.findOne({
      where: { offering: { id: offeringId } },
    });
    if (existing) {
      throw new ConflictException(
        'This offering already has a size pricing row',
      );
    }
    const entity = this.offerSizePricingRepo.create({
      normalPrice: dto.normalPrice,
      specialPrice: dto.specialPrice,
      size: dto.size,
      offering: { id: offeringId },
    });
    return this.offerSizePricingRepo.save(entity);
  }

  async updateOfferSizePricing(id: number, dto: UpdateOfferSizePricingAdminDto) {
    const row = await this.findOneOfferSizePricing(id);
    const nextSize = dto.size ?? row.size;
    const nextOfferingId = offeringIdForBoardingSize(nextSize);
    if (nextOfferingId !== row.offering?.id) {
      const taken = await this.offerSizePricingRepo.findOne({
        where: { offering: { id: nextOfferingId } },
      });
      if (taken && taken.id !== id) {
        throw new ConflictException(
          'Target offering already has a size pricing row',
        );
      }
      row.offering = { id: nextOfferingId } as Offering;
    }
    if (dto.normalPrice !== undefined) row.normalPrice = dto.normalPrice;
    if (dto.specialPrice !== undefined) row.specialPrice = dto.specialPrice;
    if (dto.size !== undefined) row.size = dto.size;
    return this.offerSizePricingRepo.save(row);
  }

  async removeOfferSizePricing(id: number) {
    await this.findOneOfferSizePricing(id);
    await this.offerSizePricingRepo.delete(id);
    return { deleted: true, id };
  }

  // --- Offer VIP pricing ---
  async findAllOfferVipPricing() {
    return this.offerVipPricingRepo.find({
      relations: { offering: true },
      order: { id: 'ASC' },
    });
  }

  async findOneOfferVipPricing(id: number) {
    const row = await this.offerVipPricingRepo.findOne({
      where: { id },
      relations: { offering: true },
    });
    if (!row) throw new NotFoundException(`OfferVipPricing ${id} not found`);
    return row;
  }

  async createOfferVipPricing(dto: CreateOfferVipPricingAdminDto) {
    const existing = await this.offerVipPricingRepo.findOne({
      where: { offering: { id: OFFERING_ID.BOARDING_VIP } },
    });
    if (existing) {
      throw new ConflictException(
        'This offering already has a VIP pricing row',
      );
    }
    const entity = this.offerVipPricingRepo.create({
      normalPrice: dto.normalPrice,
      specialPrice: dto.specialPrice,
      offering: { id: OFFERING_ID.BOARDING_VIP },
    });
    return this.offerVipPricingRepo.save(entity);
  }

  async updateOfferVipPricing(id: number, dto: UpdateOfferVipPricingAdminDto) {
    const row = await this.findOneOfferVipPricing(id);
    if (dto.normalPrice !== undefined) row.normalPrice = dto.normalPrice;
    if (dto.specialPrice !== undefined) row.specialPrice = dto.specialPrice;
    row.offering = { id: OFFERING_ID.BOARDING_VIP } as Offering;
    return this.offerVipPricingRepo.save(row);
  }

  async removeOfferVipPricing(id: number) {
    await this.findOneOfferVipPricing(id);
    await this.offerVipPricingRepo.delete(id);
    return { deleted: true, id };
  }
}
