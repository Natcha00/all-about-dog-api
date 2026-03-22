import { Injectable } from '@nestjs/common';
import {
  Announcement,
  GetAnnouncementResponse,
} from '../dtos/get-annoucement.dto';
import { OfferingRepository } from '../offering.repository';
import { OfferBreedPricing } from '../entities/offer-breed-pricing.entity';
import { Offering } from '../entities/offering.entity';
import { OfferCoatPricing } from '../entities/offer-coat-pricing.entity';
import {
  buildSwimmingCoatBandsByCoat,
  formatSwimmingCoatBandLabel,
} from '../swimming-pricing';

@Injectable()
export class GetAnnouncementUsecase {
  constructor(private readonly offeringRepository: OfferingRepository) {}

  async execute(): Promise<GetAnnouncementResponse> {
    // ราคาว่ายน้ำอ้างอิงจากโครงสร้าง coat + น้ำหนัก + ช่วงน้ำหนักพิเศษตามสายพันธุ์ (เหมือน use case คิดราคา)
    const [coatPricings, breedBandPricings] = await Promise.all([
      this.offeringRepository.getOfferCoatPricing(),
      this.offeringRepository.getSwimmingBreedWeightBandPricing(),
    ]);
    const minCoatPrice =
      coatPricings.length > 0
        ? Math.min(...coatPricings.map((p) => p.price))
        : 0;

    const swimmingAnnouncement = this.getSwimmingByCoatAnnouncement(
      minCoatPrice,
      coatPricings,
      breedBandPricings,
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
        // 'VIP เหมารอบไม่มีค่ายบริการเพิ่ม แต่ต้องเป็นรอบที่ว่างสนิท',
      ],
      pricingTitle: 'อัตราค่าบริการ',
      pricingNote: `ราคาว่ายน้ำเริ่มต้นที่ 500 บาท ขึ้นกับน้ำหนักและขนาดสายพันธุ์`,

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

  /**
   * สร้าง contents ของประกาศว่ายน้ำตามโครงสร้างการคิดราคาจริง (coat + น้ำหนัก + ช่วงพิเศษตามสายพันธุ์)
   */
  private buildSwimmingByCoatContents(
    coatPricings: Array<OfferCoatPricing>,
    breedBandPricings: Array<OfferBreedPricing>,
  ): Array<{
    priceLabel: string;
    description: string;
    breeds: Array<string>;
  }> {
    const bandsByCoat = buildSwimmingCoatBandsByCoat(coatPricings);

    const contents: Array<{
      priceLabel: string;
      description: string;
      breeds: Array<string>;
    }> = [];

    for (const [coat, bands] of bandsByCoat.entries()) {
      for (const row of bands) {
        const weightLabel = formatSwimmingCoatBandLabel(
          row.minWeightKg,
          row.maxWeightKg,
        );
        contents.push({
          priceLabel: `${coat} (${weightLabel}) ${row.price} บาท`,
          description: '',
          breeds: [],
        });
      }
    }

    for (const p of breedBandPricings) {
      if (
        p.breed?.nameTh &&
        p.minWeightKg != null &&
        p.maxWeightKg != null
      ) {
        contents.push({
          priceLabel: `${p.breed.nameTh} ${p.minWeightKg}-${p.maxWeightKg} kg ${p.normalPrice} บาท`,
          description: '',
          breeds: [],
        });
      }
    }

    return contents;
  }

  private getSwimmingByCoatAnnouncement(
    minPrice: number,
    coatPricings: Array<OfferCoatPricing>,
    breedBandPricings: Array<OfferBreedPricing>,
  ) {
    const contents = this.buildSwimmingByCoatContents(
      coatPricings,
      breedBandPricings,
    );
    return {
      title: 'สระว่ายน้ำ',
      intro: [
        'สระว่ายน้ำระบบเกลือมาตรฐาน 8x3 เมตร ว่ายได้ทั้งสุนัขและเจ้าของ',
        'ให้บริการเป็นรอบ รอบละ 1 ชั่วโมง',
        'เปิดทุกวันไม่มีวันหยุด เวลา 10.00 -19.00 น.'
      ],
      highlights: [
        'จำกัดจำนวนไม่เกิน 5 ตัว/รอบ',
        "ราคาว่ายน้ำ รวมอาบน้ำ บีบต่อม ตัดเล็บ เช็ดหู ไถเท้า ไถท้อง เปิดก้น แจ้งเพิ่มเติมได้ ไม่มีค่าใช้จ่ายเพิ่ม",
        "น้องผลัดขน มีค่าบริการสางขนเพิ่ม เริ่มต้นที่ 200 บาท",
        "หากน้องอึในสระ มีค่าเปลี่ยนน้ำ 5,000บาท",
        'การจองว่ายน้ำในแอปเป็นราคาโดยประมาณ และชำระค่าบริการหน้างาน',
        'การยืนยันสิทธิ์จองว่ายน้ำจะสมบูรณ์เมื่อเจ้าหน้าที่อนุมัติรายการ',
        // 'VIP เหมารอบไม่มีค่ายบริการเพิ่ม แต่ต้องเป็นรอบที่ว่างสนิท',
      ],
      pricingTitle: 'อัตราค่าบริการ',
      pricingNote: `ราคาว่ายน้ำเริ่มต้นที่ ${minPrice} บาท (ราคาประมาณ) ขึ้นกับน้ำหนักและขนาดสายพันธุ์ ชำระเงินหน้างาน`,
      contents,
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
        'มีสนามวิ่ง 3 สนาม และปล่อยวิ่งวันละ 3 รอบ (ช่วงเช้า กลางวัน และเย็น)',
        'มีบริการกล้องดูแลตลอด 24 ชั่วโมง (ไม่รองรับการสนทนาผ่านกล้อง)',
        'เวลาให้อาหารรอบเช้า 07:00-08:00 น. และรอบเย็น 15:00-16:00 น.',
        'เปิดทุกวันไม่มีวันหยุด'
      ],
      pricingTitle: 'ประเภทห้องและราคา',
      pricingNote: 'ราคาค่าฝากคิดเป็นคืน',
      contents,
      conditionTitle: 'ข้อกำหนดการให้บริการ',
      conditions: [
        'สุนัขต้องได้รับวัคซีนครบถ้วน ได้รับยาป้องกันเห็บหมัดครบ ไม่มีโรคประจำตัวร้ายแรง และต้องไม่ก้าวร้าวจนพี่เลี้ยงไม่สามารถควบคุมได้',
        'สามารถรับฝากและรับกลับได้ในช่วงเวลา 09:00-19:00 น. นอกช่วงเวลาดังกล่าวมีค่าบริการล่วงเวลาชั่วโมงละ 50 บาท ไม่เกิน 21.00 น.',
        'ค่าบริการไม่รวมอาหาร กรุณานำอาหารของน้องมาเอง โดยสามารถนำผ้าปูนอนหรือแผ่นรองซับมาเพิ่มเติมได้ (ทางร้านมีชามอาหารและชามน้ำให้)',
        'กรณีฝากเลี้ยง การจองจะสมบูรณ์เมื่อชำระเงินแล้วเท่านั้น หากยังไม่ชำระ ทางร้านขอสงวนสิทธิ์ไม่กันห้องพัก',
        'เงื่อนไขการยกเลิกการฝาก: แจ้งยกเลิกล่วงหน้าก่อนวันฝาก 7 วัน คืนเงินเต็มจำนวน, แจ้งยกเลิกภายใน 7 วันก่อนวันฝาก คืนเงิน 50%, และหากยกเลิกในวันฝาก ไม่สามารถคืนเงินได้ทุกกรณี',
      ],
    };
  }

  private getBoardingContents(offerings: Array<Offering>) {
    const result = offerings.map((o) => {
      return {
        priceLabel: `${o.name} (${o.maxCapacity} ห้อง)`,
        description: o.description ?? '',
        breeds: [
          `คืนละ ${o.isVip ? o.offerVipPricing?.normalPrice : o.offerSizePricing?.normalPrice} ต่อคืน`,
          `ตัวที่ 2 นอนด้วยกัน ตัวละ ${o.isVip ? o.offerVipPricing?.specialPrice : o.offerSizePricing?.specialPrice} ต่อคืน`,
        ],
      };
    });

    return result;
  }
}
