import { Injectable } from '@nestjs/common';
import {
  Announcement,
  GetAnnouncementResponse,
} from '../dtos/get-annoucement.dto';
import { OfferingRepository } from '../offering.repository';
import { OfferBreedPricing } from '../entities/offer-breed-pricing.entity';
import { Offering } from '../entities/offering.entity';

@Injectable()
export class GetAnnouncementUsecase {
  constructor(private readonly offeringRepository: OfferingRepository) {}

  async execute(): Promise<GetAnnouncementResponse> {
    const swimmingPricing = await this.offeringRepository.getBreedPricing();
    const minPrice =  this.swimmingPricingMinPrice(swimmingPricing);
    const groupSwimmingPricing =
      this.swimmingPricingGroupByPrice(swimmingPricing);
    const swimmingContents = this.getSwimmingContents(groupSwimmingPricing);

    const swimmingAnnouncement = this.getSwimmingAnnouncement(
      minPrice,
      swimmingContents,
    );

    const boardingOffer = await this.offeringRepository.getBoardingOffering();
    const boardingContents = this.getBoardingContents(boardingOffer);
    const boardingAnnoucement = this.getBoardingAnnoucement(boardingContents);
    return {
      swimming: swimmingAnnouncement as Announcement,
      boarding: boardingAnnoucement as Announcement,
    } as any;
  }

  private swimmingPricingMinPrice(pricings: Array<OfferBreedPricing>) {
    return Math.min(...pricings.map((p) => p.normalPrice));
  }

  private swimmingPricingGroupByPrice(pricings: Array<OfferBreedPricing>) {
    const result = pricings.reduce(
      (
        acc: { price: number; specialPrice: number; breeds: Array<string> }[],
        pricing: OfferBreedPricing,
        i: number,
      ) => {
        const foundPrice = acc.find(
          (p) =>
            p.price == pricing.normalPrice && p.price == pricing.specialPrice,
        );
        if (!foundPrice) {
          acc.push({
            price: pricing.normalPrice,
            specialPrice: pricing.specialPrice,
            breeds: [pricing.breed.nameTh],
          });
        }
        foundPrice?.breeds.push(pricing.breed.nameTh);
        return acc;
      },
      [],
    );
    return result;
  }

  private getSwimmingContents(
    pricings: Array<{
      price: number;
      specialPrice: number;
      breeds: Array<string>;
    }>,
  ) {
    return pricings.map((p) => ({
      priceLabel: `${p.price} บาท`,
      description: '',
      breeds: p.breeds,
    }));
  }

  private getSwimmingAnnouncement(
    minPrice: number,
    contents: Array<{
      priceLabel: string;
      description: string;
      breeds: Array<string>;
    }>,
  ) {
    return {
      title: 'สระว่ายน้ำ',
      intro: [
        'สระว่ายน้ำระบบเกลือมาตรฐาน 8x3 เมตร ว่ายได้ทั้งสุนัขและเจ้าของ',
        'ให้บริการเป็นรอบ รอบละ 1 ชั่วโมง',
      ],
      highlights: [
        'เปิดให้บริการวันอังคารถึงวันอาทิตย์ (หยุดเฉพาะวันจันทร์) เวลา 10:00-19:00 น.',
        'จำกัดจำนวนไม่เกิน 5 ตัว/รอบ',
        'VIP เหมารอบไม่มีค่ายบริการเพิ่ม แต่ต้องเป็นรอบที่ว่างสนิท',
      ],
      pricingTitle: 'อัตราค่าบริการ',
      pricingNote: `ราคาว่ายน้ำเริ่มต้นที่ ${minPrice} บาท ขึ้นกับน้ำหนักและขนาดสายพันธุ์`,

      contents: contents,
      conditionTitle: 'ข้อกำหนดการให้บริการ',
      conditions: [
        'กรุณาจองรอบล่วงหน้า และมาก่อนเวลา 10 นาทีเพื่อเตรียมตัว',
        'น้องหมาต้องไม่มีโรคติดต่อ และไม่อยู่ช่วงติดสัด',
        'ต้องแสดงหลักฐานการฉีดวัคซีน และไม่ดุร้ายจนควบคุมไม่ได้',
        'กรณีผลัดขนหนัก อาจมีค่าทำความสะอาดเพิ่ม 200+ บาท',
      ],
    };
  }

  private getBoardingAnnoucement(
    contents: Array<{
      priceLabel: string;
      description: string;
      breeds: Array<string>;
    }>,
  ) {
    return {
      title: 'บริการรับฝากเลี้ยง',
      intro: ['โรงแรมของเรามีห้องพัก 3 ประเภท'],
      highlights: [
        'มี 3 สนามใหญ่ ปล่อยวิ่ง 4-5 รอบ/วัน',
        'มีกล้องให้ดูตามห้องพักของน้อง',
      ],
      pricingTitle: 'ประเภทห้องและราคา',
      pricingNote: 'ราคาค่าฝากคิดเป็นคืน',
      contents,
      conditionTitle: 'ข้อกำหนดการให้บริการ',
      conditions: [
        'เจ้าของสามารถ check-in ตั้งแต่ 8:00 น. เป็นต้นไป และ check-out ไม่เกิน 18:00 น. (หลัง 18:00 น. คิดค่ารับฝากชั่วโมงละ 50 บาท)',
        'ค่าบริการไม่รวมอาหาร กรุณานำอาหารของน้องมาเอง รวมถึงสายจูงและเบาะนอน',
        'ต้องไม่มีเห็บหมัด ต้องแสดงหลักฐานการฉีดวัคซีน และไม่ดุร้ายจนควบคุมไม่ได้',
      ],
    };
  }

  private getBoardingContents(offerings: Array<Offering>) {
    const result = offerings.map((o) => {
      return {
        priceLabel: `${o.name} (${o.maxCapacity} ห้อง)`,
        description: o.description,
        breeds: [
          `คืนละ ${o.isVip ? o.offerVipPricing?.normalPrice : o.offerSizePricing[0]?.normalPrice} ต่อคืน`,
          `ตัวที่ 2 นอนด้วยกัน ตัวละ ${o.isVip ? o.offerVipPricing?.specialPrice : o.offerSizePricing[0]?.specialPrice} ต่อคืน`,
        ],
      };
    });

    return result;
  }
}
